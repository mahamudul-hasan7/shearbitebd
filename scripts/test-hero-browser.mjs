import assert from "node:assert/strict";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { uiLabel } from "../tests/ui-labels.mjs";

const base=process.env.BASE_URL || "http://127.0.0.1:3000";
const artifacts=".local-postgres/hero-story";
await mkdir(artifacts,{recursive:true});
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || (process.platform==="win32" ? "msedge" : undefined)});
const results=[];
const waitIndex=(page,selector,index)=>page.waitForFunction(({selector,index})=>document.querySelector(`${selector} [data-testid="hero-story-media"]`)?.dataset.slide===String(index),{selector,index},{timeout:12_000});
try {
  for(const [width,height,language] of [[320,844,"bn"],[390,844,"en"],[768,1024,"bn"],[844,390,"en"],[1440,900,"bn"],[1440,900,"en"]]) {
    const context=await browser.newContext({baseURL:base,viewport:{width,height},hasTouch:width<1024});
    await context.addInitScript(lang=>localStorage.setItem("sharebite_preferred_lang",lang),language);
    const page=await context.newPage();const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto("/",{waitUntil:"networkidle"});
    const selector=width<1024 ? "#mobile-home" : "#hero";
    const hero=page.locator(selector);
    const media=hero.getByTestId("hero-story-media");
    const slogan=hero.getByTestId("hero-slogan-line");
    const controls=hero.getByTestId("hero-story-controls");
    await media.locator('img[data-active="true"]').waitFor();
    await page.waitForFunction(selector=>{const img=document.querySelector(`${selector} img[data-active="true"]`);return img?.complete && img.naturalWidth>0;},selector);
    assert.equal(await controls.getByRole("button").count(),4,"Three photo dots and one pause control");
    assert.equal(/[.।]\s*$/.test(await slogan.textContent()),false,"The final slogan has no full stop or Bangla dari");
    await page.evaluate(()=>document.fonts.ready);
    const headingBox=await hero.locator("h1").boundingBox();
    const action=hero.locator('a[href]').first();const actionBox=await action.boundingBox();
    if((width===390&&language==="en") || (width===1440&&language==="bn")) {
      await page.waitForFunction(selector=>document.querySelector(`${selector} [data-testid="hero-slogan-line"]`)?.dataset.running==="true",selector);
      await controls.getByRole("button",{name:uiLabel("Pause slideshow",language),exact:true}).click();
      await controls.getByRole("button").nth(0).click();await waitIndex(page,selector,0);
      const before=await page.evaluate(()=>performance.now());
      await controls.getByRole("button",{name:uiLabel("Play slideshow",language),exact:true}).click();
      await waitIndex(page,selector,1);
      const elapsed=await page.evaluate(()=>performance.now())-before;
      assert.ok(elapsed>=5500 && elapsed<8000,`Photographs must still change about every six seconds (${elapsed} ms)`);
      assert.equal(await slogan.getAttribute("data-slide"),"1");
    }
    assert.equal(await slogan.locator(':scope > span').nth(1).evaluate(el=>getComputedStyle(el).animationName),"none","The slogan text must stay still while images change");
    assert.equal(await slogan.locator(':scope > span').nth(1).evaluate(el=>getComputedStyle(el).opacity),"1");
    await controls.getByRole("button",{name:uiLabel("Pause slideshow",language),exact:true}).click();
    await controls.getByRole("button",{name:uiLabel("Play slideshow",language),exact:true}).waitFor();
    await controls.getByRole("button").nth(2).click();await waitIndex(page,selector,2);
    await page.waitForFunction(selector=>{const img=document.querySelector(`${selector} img[data-active="true"]`);return img?.complete && img.naturalWidth>0 && Number(getComputedStyle(img).opacity)>.99;},selector);
    assert.equal(await slogan.getAttribute("data-slide"),"2");
    assert.equal(await controls.getByRole("button").nth(2).getAttribute("aria-pressed"),"true");
    const nextHeading=await hero.locator("h1").boundingBox();const nextAction=await action.boundingBox();
    for(const key of ["x","y","width","height"]) {
      assert.ok(Math.abs(nextHeading[key]-headingBox[key])<=1,`The heading must reserve a stable layout: ${key} ${JSON.stringify({headingBox,nextHeading})}`);
      assert.ok(Math.abs(nextAction[key]-actionBox[key])<=1,`The action buttons must not move between photographs: ${key} ${JSON.stringify({actionBox,nextAction})}`);
    }
    for(const type of ["pointerdown","pointermove","pointerup"]) await hero.dispatchEvent(type,{pointerType:"touch",isPrimary:true,clientX:type==="pointerdown"?280:30,clientY:150});
    assert.equal(await media.getAttribute("data-slide"),"2","A horizontal touch drag must not change photographs");
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const boxes=await controls.getByRole("button").evaluateAll(buttons=>buttons.map(button=>button.getBoundingClientRect().toJSON()));
    assert.ok(boxes.every(box=>box.x>=0 && box.x+box.width<=width && box.height>=32));
    await hero.screenshot({path:`${artifacts}/hero-${width}-${language}.png`});
    await page.clock.install();await page.clock.fastForward(12_100);
    assert.equal(await media.getAttribute("data-slide"),"2","Explicit pause must stop the shared timer");
    await controls.getByRole("button",{name:uiLabel("Play slideshow",language),exact:true}).click();
    await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:"instant"}));
    await page.waitForFunction(selector=>document.querySelector(`${selector} [data-testid="hero-slogan-line"]`)?.dataset.running==="false",selector);
    const hiddenIndex=await media.getAttribute("data-slide");
    await page.clock.fastForward(12_100);assert.equal(await media.getAttribute("data-slide"),hiddenIndex,"An offscreen hero must stop its timer");
    await page.emulateMedia({reducedMotion:"reduce"});
    await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
    await controls.getByRole("button").nth(0).click();await waitIndex(page,selector,0);
    await page.clock.fastForward(12_100);
    assert.equal(await media.getAttribute("data-slide"),"0");
    assert.equal(await slogan.evaluate(el=>el.getAnimations({subtree:true}).length),0);
    assert.equal(await media.locator('img[data-active="true"]').evaluate(el=>getComputedStyle(el).transitionDuration),"0s");
    assert.deepEqual(errors,[]);
    results.push({width,height,language,passed:true});await context.close();
  }
  // A failed future photograph must never replace the visible photograph with an empty frame.
  const context=await browser.newContext({baseURL:base,viewport:{width:390,height:844}});
  await context.route(url=>url.pathname==="/_next/image" && url.searchParams.get("url")?.includes("rider-collection"),route=>route.abort());
  const page=await context.newPage();await page.goto("/",{waitUntil:"networkidle"});
  const hero=page.locator("#mobile-home");
  await hero.locator('img[src*="ngo-distribution"]').waitFor();
  await page.waitForFunction(()=>{const img=document.querySelector('#mobile-home img[src*="ngo-distribution"]');return img?.complete&&img.naturalWidth>0;});
  await page.clock.install();await page.clock.fastForward(6100);await waitIndex(page,"#mobile-home",2);
  assert.equal(await hero.locator('img[data-active="true"]').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  await context.close();
  const assetSizes=await Promise.all(["food-sharing","rider-collection","ngo-distribution"].map(async name=>({name,bytes:(await stat(`public/images/hero/${name}.webp`)).size})));
  assert.ok(assetSizes.reduce((total,asset)=>total+asset.bytes,0)<400_000,"All three source photographs should remain under 400 KB combined");
  await writeFile(`${artifacts}/checks.json`,JSON.stringify({results,assetSizes},null,2));
  console.log(`Hero slideshow: ${results.length} responsive/language cases, timing, layout, dots, no swipe, pause, reduced motion and image failure passed`);
} finally {await browser.close();}
