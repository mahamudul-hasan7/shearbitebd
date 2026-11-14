import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { uiLabel } from "./ui-labels.mjs";

export async function runLiveMotionChecks({base,login,prisma,newDonation}) {
  const artifacts=".local-postgres/live-motion";
  await mkdir(artifacts,{recursive:true});
  const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || undefined});
  const results=[];
  try {
    for(const role of ["DONOR","NGO","VOLUNTEER"]) {
      const {cookie}=await login(role);
      const portal=role==="VOLUNTEER"?"volunteer":role.toLowerCase();
      for(const [width,height,language] of [[320,844,"bn"],[390,844,"en"],[768,1024,"en"],[844,390,"bn"],[1280,900,"en"]]) {
        const context=await browser.newContext({baseURL:base,viewport:{width,height}});
        await context.addInitScript(lang=>localStorage.setItem("sharebite_preferred_lang",lang),language);
        await context.addInitScript(()=>{
          window.__dockMoves=[];
          const native=Element.prototype.animate;
          Element.prototype.animate=function(frames,options){
            if(this.getAttribute("data-testid")==="mobile-nav-selection") window.__dockMoves.push({frames,duration:options?.duration});
            return native.call(this,frames,options);
          };
        });
        const [name,value]=cookie.split("=");
        await context.addCookies([{name,value,url:base,httpOnly:true,sameSite:"Lax"}]);
        const page=await context.newPage();const errors=[];
        page.on("pageerror",error=>errors.push(error.message));
        await page.goto(`/${portal}/dashboard`,{waitUntil:"networkidle"});
        const nav=page.getByRole("navigation",{name:uiLabel(width<1024?"Mobile Bottom App Navigation":"Account sidebar",language),exact:true});
        await nav.waitFor();
        if(role==="DONOR" && width===390) {
          const bell=page.getByRole("button",{name:uiLabel("Open notifications",language),exact:true}).locator("svg[data-live-icon]");
          await bell.evaluate(svg=>{svg.dataset.rings="0";svg.addEventListener("animationstart",()=>{svg.dataset.rings=String(Number(svg.dataset.rings)+1);});});
          await prisma.notification.create({data:{userId:"test-DONOR",type:"SYSTEM",title:"First new update",message:"An actual stored update for the empty inbox.",href:"/donor/notifications"}});
          await page.evaluate(()=>window.dispatchEvent(new Event("sharebite:notification")));
          await page.waitForFunction(svg=>Number(svg.dataset.rings)>0,await bell.elementHandle());
          await page.waitForFunction(svg=>svg.dataset.liveMotion==="interaction",await bell.elementHandle());
          const rings=Number(await bell.getAttribute("data-rings"));
          const refreshed=page.waitForResponse(response=>response.url().includes("/api/notifications") && response.request().method()==="GET");
          await page.evaluate(()=>window.dispatchEvent(new Event("sharebite:notifications-changed")));
          await refreshed;
          assert.equal(Number(await bell.getAttribute("data-rings")),rings,"Refreshing the same update must not ring again");
          for(const [title,sampleImageId] of [["Covered rice for the community","packed-meals"],["Fresh lunch boxes to share","meal-trays"]]) {
            assert.equal((await newDonation(cookie,{title,sampleImageId})).response.status,201);
          }
          await page.reload({waitUntil:"networkidle"});
        }
        const dock=page.getByTestId("mobile-bottom-nav");
        if(width<1024) {
          const box=await dock.boundingBox();
          assert.ok(box.x>=9 && box.x+box.width<=width-9 && box.y+box.height<=height-9,"The glass dock floats inside the viewport");
          assert.ok(box.width<=560 && box.height>=76);
          assert.match(await dock.evaluate(el=>getComputedStyle(el).backdropFilter),/blur\(/,"The glass surface must blur the content behind it");
          assert.ok(await page.locator("main").evaluate(el=>parseFloat(getComputedStyle(el.parentElement).paddingBottom))>=120,"Content reserves enough space above the floating action");
          for(const link of await dock.getByRole("link").all()) assert.ok((await link.boundingBox()).height>=44,"Every navigation target stays large enough to tap");
          const labelBounds=await dock.locator("span").evaluateAll(elements=>elements.filter(el=>el.children.length===0 && el.textContent.trim()).map(el=>el.getBoundingClientRect().toJSON()));
          assert.ok(labelBounds.every(label=>label.x>=box.x && label.x+label.width<=box.x+box.width+1 && label.y+label.height<=box.y+box.height),"Both languages fit the glass surface");
          const selected=dock.locator('a[aria-current="page"]').first();
          assert.ok(Math.abs((await selected.boundingBox()).x-(await dock.getByTestId("mobile-nav-selection").boundingBox()).x)<=1,"The glass highlight aligns with the selected tab");
        } else assert.equal(await dock.isVisible(),false,"Desktop keeps its sidebar navigation");
        const candidate=nav.locator('a:not([aria-current])').filter({has:page.locator('svg[data-live-motion="interaction"]')}).first();
        const target=nav.locator(`a[href="${await candidate.getAttribute("href")}"]`);
        const glyph=target.locator('svg[data-live-icon]').first();
        await glyph.evaluate(svg=>{svg.dataset.starts="0";svg.addEventListener("animationstart",()=>{svg.dataset.starts=String(Number(svg.dataset.starts)+1);});});
        await target.dispatchEvent("pointerdown",{pointerType:"touch"});
        await page.waitForFunction(svg=>Number(svg.dataset.starts)>0,await glyph.elementHandle());
        await page.waitForFunction(svg=>svg.dataset.liveMotion==="interaction",await glyph.elementHandle());
        const previous=Number(await glyph.getAttribute("data-starts"));
        await target.focus();
        await page.waitForFunction(({svg,previous})=>Number(svg.dataset.starts)>previous,{svg:await glyph.elementHandle(),previous});
        await page.waitForFunction(svg=>svg.dataset.liveMotion==="interaction",await glyph.elementHandle());
        await page.emulateMedia({reducedMotion:"reduce"});
        await target.dispatchEvent("pointerdown",{pointerType:"touch"});
        assert.equal(await glyph.evaluate(svg=>svg.getAnimations({subtree:true}).length),0,"Reduced motion must leave interaction icons still");
        await page.emulateMedia({reducedMotion:"no-preference"});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${role} ${width} overflow`);
        await page.screenshot({path:`${artifacts}/${portal}-${width}-${language}.png`,animations:"disabled"});
        const href=await target.getAttribute("href");
        await target.click();await page.waitForURL(url=>url.pathname===new URL(href,base).pathname);
        if(width<1024) {
          await page.getByTestId("mobile-bottom-nav").locator(`a[aria-current="page"][href="${href}"]`).waitFor();
          assert.ok(await page.evaluate(()=>window.__dockMoves.some(move=>move.duration===320)),"The selected glass highlight travels to the next tab");
          if(width===320) {
            const moveCount=await page.evaluate(()=>window.__dockMoves.length);
            await page.emulateMedia({reducedMotion:"reduce"});
            await page.getByTestId("mobile-bottom-nav").locator(`a[href="/${portal}/dashboard"]`).click();
            await page.waitForURL(url=>url.pathname===`/${portal}/dashboard`);
            await page.getByTestId("mobile-bottom-nav").locator(`a[aria-current="page"][href="/${portal}/dashboard"]`).waitFor();
            assert.equal(await page.evaluate(()=>window.__dockMoves.length),moveCount,"Reduced motion must also stop the sliding highlight");
          }
        }
        assert.deepEqual(errors,[]);
        results.push({role,width,height,language,passed:true});
        await context.close();
      }
    }
    for(const width of [390,1280]) {
      const context=await browser.newContext({baseURL:base,viewport:{width,height:900}});
      const page=await context.newPage();await page.goto("/",{waitUntil:"networkidle"});
      const groups=page.locator('div[data-motion]:has(svg[data-live-motion="ambient"])');
      let group;
      for(const candidate of await groups.all()) { if(await candidate.isVisible()) {group=candidate;break;} }
      assert.ok(group,"The landing page must include a visible group of purposeful icons");
      await group.scrollIntoViewIfNeeded();
      await page.waitForFunction(el=>el.dataset.motion==="running",await group.elementHandle());
      assert.ok(await group.locator('svg[data-live-icon]').count()>=3);
      await page.emulateMedia({reducedMotion:"reduce"});
      assert.equal(await group.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.effect?.target instanceof SVGElement).length),0);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await group.screenshot({path:`${artifacts}/landing-icons-${width}.png`});
      await context.close();
    }
    await writeFile(`${artifacts}/checks.json`,JSON.stringify(results,null,2));
  } finally {await browser.close();}
}
