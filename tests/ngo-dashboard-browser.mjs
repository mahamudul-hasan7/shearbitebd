import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { uiLabel, uiName } from "./ui-labels.mjs";

export async function runNgoDashboardBrowserChecks({prisma,base,login,secondLogin,newDonation,assignedRescue,deliveredRescue,saveReceipt,distributionInput,distribute,jsonResult,handover,issue}) {
  const artifacts=".local-postgres/ngo-dashboard";await mkdir(artifacts,{recursive:true});
  await prisma.user.update({where:{id:"test-NGO"},data:{displayName:"Campus Food Support"}});
  await prisma.nGOProfile.update({where:{userId:"test-NGO"},data:{organizationName:"Campus Food Support",capacityMealsPerDay:250,registrationNumber:"NGO-2026-1234"}});
  await prisma.address.updateMany({where:{ownerId:"test-NGO"},data:{latitude:null,longitude:null}});
  const completed=await deliveredRescue();await saveReceipt(completed);assert.equal((await distribute(completed,await distributionInput(completed))).status,201);
  const delivered=await deliveredRescue();const assigned=await assignedRescue();
  const donor=(await login()).cookie,ngo=(await login("NGO")).cookie;
  const reserved=await newDonation(donor,{title:"Awaiting food pickup"});assert.equal(reserved.response.status,201);await jsonResult("/api/claims",{cookie:ngo,method:"POST",body:{donationId:reserved.body.donation.id}},201);
  const first=await newDonation(donor,{title:"Shared vegetable lunch"});const second=await newDonation(donor,{title:"Next food collection",safePickupDeadline:new Date(Date.now()+7200_000).toISOString()});assert.equal(first.response.status,201);assert.equal(second.response.status,201);
  await prisma.donation.update({where:{id:first.body.donation.id},data:{pickupLatitude:23.781,pickupLongitude:90.422}});
  const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || undefined});const results=[];
  try {
    for(const [width,height,language] of [[320,844,"bn"],[390,844,"en"],[768,1024,"bn"],[844,390,"en"],[1280,900,"en"],[1440,900,"bn"]]) {
      const context=await browser.newContext({baseURL:base,viewport:{width,height}});await context.addInitScript(lang=>localStorage.setItem("sharebite_preferred_lang",lang),language);
      const [name,value]=ngo.split("=");await context.addCookies([{name,value,url:base,httpOnly:true,sameSite:"Lax"}]);
      const page=await context.newPage();const errors=[];page.on("pageerror",error=>errors.push(error.message));
      await page.goto("/ngo/dashboard",{waitUntil:"networkidle"});const root=page.getByTestId("ngo-dashboard");await root.waitFor();
      const active=root.getByTestId("ngo-active-work");await active.locator("article").first().waitFor();assert.equal(await active.locator("article").first().getAttribute("data-claim-id"),delivered.claim.id);
      const order=await root.evaluate(e=>[...e.children].map(child=>child.getAttribute('data-testid')));assert.equal(order[0],"ngo-stats-section");assert.equal(order[1],"ngo-active-work");
      assert.equal(await page.getByRole("heading",{name:new RegExp("Campus Food Support")}).count(),1,"The large organization title is not repeated in a banner");
      const locale=language==="bn"?"bn-BD":"en-BD";
      const impact=await jsonResult("/api/impact",{cookie:ngo});
      const metric=key=>root.locator(`[data-stat="${key}"] > p`).first();
      assert.equal(await metric("meals").textContent(),impact.mealsDistributed.toLocaleString(locale));assert.equal(await metric("people").textContent(),impact.beneficiariesServed.toLocaleString(locale));
      if(language==="bn")assert.equal(/[0-9]/.test(await root.getByTestId("ngo-stats").innerText()),false,"All statistical digits must use the selected language");
      assert.equal(await root.getByTestId("ngo-stats").getByText(uiLabel("Active",language),{exact:true}).count(),0,"Cumulative totals must not carry a fake Active badge");
      assert.equal(await active.getByText("ETA",{exact:true}).count(),0,"Do not show an invented pickup ETA");
      if(width===390){
        const stats=root.getByTestId("ngo-stats");
        await page.waitForFunction(()=>document.querySelector('[data-testid="ngo-stats"]')?.getAttribute('data-motion')==='running');
        const movingParts=()=>stats.evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.effect?.target instanceof SVGElement).length);
        assert.ok(await movingParts()>=8,"The icons animate their individual working parts");
        const lid=stats.locator('[data-stat="nearby"] svg path').last();
        const initialTransform=await lid.evaluate(el=>getComputedStyle(el).transform);
        await page.waitForFunction(initial=>getComputedStyle(document.querySelector('[data-stat="nearby"] svg path:last-child')).transform!==initial,initialTransform);
        await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await movingParts(),0,"Reduced motion leaves every icon still");
        await page.emulateMedia({reducedMotion:'no-preference'});
        await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
        await page.waitForFunction(()=>document.querySelector('[data-testid="ngo-stats"]')?.getAttribute('data-motion')==='paused');
        await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
        await page.waitForFunction(()=>document.querySelector('[data-testid="ngo-stats"]')?.getAttribute('data-motion')==='running');
      }
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      const outside=await root.locator('a,button,summary').evaluateAll(els=>els.filter(e=>e.checkVisibility()).map(e=>({text:e.textContent.trim(),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left < -1 || e.right > innerWidth+1));assert.deepEqual(outside,[]);
      if(width===320){assert.equal(await metric("nearby").textContent(),"—");await root.getByTestId("ngo-location-needed").waitFor();assert.equal(await root.getByTestId("ngo-location-needed").getByRole("link").getAttribute("href"),"/ngo/addresses");}
      const details=root.locator(':scope > details').first();await details.locator("summary").click();assert.ok((await root.getByTestId("ngo-capacity").textContent()).includes((250).toLocaleString(locale)));assert.equal(await details.getByText("NGO-2026-1234",{exact:true}).count(),1);await details.locator("summary").click();
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${artifacts}/dashboard-${width}-${language}.png`,animations:"disabled"});
      if(width===390){
        await prisma.address.updateMany({where:{ownerId:"test-NGO"},data:{latitude:23.78,longitude:90.42}});await page.evaluate(()=>window.dispatchEvent(new Event("focus")));await page.waitForFunction(()=>document.querySelector('[data-stat="nearby"] > p')?.textContent==='1');assert.equal(await root.getByTestId("ngo-location-needed").count(),0);
        assert.equal((await handover(assigned,assigned.volunteer,"verify","PICKUP",await issue(assigned,"PICKUP"))).status,200);
        await page.waitForFunction(id=>document.querySelector(`[data-claim-id="${id}"]`)?.getAttribute('data-status')==='PICKED_UP',assigned.claim.id,{timeout:10_000});
        const recommended=root.getByTestId("ngo-recommended-food");assert.equal(await recommended.getAttribute("data-donation-id"),first.body.donation.id);
        let posts=0;page.on('request',r=>{if(r.url()===base+'/api/claims'&&r.method()==='POST')posts++;});await recommended.getByRole("button",{name:uiName("Claim donation"),exact:true}).evaluate(button=>{button.click();button.click();});
        await page.waitForFunction(id=>document.querySelector('[data-testid="ngo-recommended-food"]')?.getAttribute('data-donation-id')===id,second.body.donation.id);assert.equal(posts,1);assert.equal(await recommended.getByRole("button",{name:uiName("Claim donation"),exact:true}).isEnabled(),true,"The next recommendation must not inherit Claimed from the previous post");
        await prisma.donation.update({where:{id:second.body.donation.id},data:{pickupLatitude:22.35,pickupLongitude:91.8}});await page.evaluate(()=>window.dispatchEvent(new Event("focus")));await page.waitForFunction(()=>document.querySelector('[data-stat="nearby"] > p')?.textContent==='0');
        await context.route("**/api/impact",route=>route.fulfill({status:503,json:{error:"Injected dashboard failure"}}));await page.evaluate(()=>window.dispatchEvent(new Event("focus")));await root.getByRole("alert").waitFor({timeout:10_000});assert.ok(await active.locator("article").count()>0,"A refresh failure keeps the saved active work visible");
        await context.unroute("**/api/impact");await root.getByRole("alert").getByRole("button",{name:uiName("Retry"),exact:true}).click();await root.getByRole("alert").waitFor({state:"hidden"});
        const firstAction=active.locator("article").first().getByRole("link");assert.equal(await firstAction.getAttribute("href"),`/ngo/claims/${delivered.claim.id}`);
      }
      assert.deepEqual(errors,[]);results.push({width,height,language,passed:true});await context.close();
    }
    // Switching NGO accounts in the same live page must never reuse the first NGO's snapshot.
    const context=await browser.newContext({baseURL:base,viewport:{width:390,height:844}});const [name,value]=ngo.split('=');await context.addCookies([{name,value,url:base,httpOnly:true,sameSite:'Lax'}]);const page=await context.newPage();await page.goto('/ngo/dashboard',{waitUntil:'networkidle'});const root=page.getByTestId('ngo-dashboard');await root.waitFor();const other=await secondLogin('NGO');const [otherName,otherValue]=other.split('=');await context.addCookies([{name:otherName,value:otherValue,url:base,httpOnly:true,sameSite:'Lax'}]);await page.evaluate(()=>window.dispatchEvent(new Event('sharebite:auth-changed')));await page.waitForFunction(()=>document.querySelector('[data-stat="active"] > p')?.textContent==='০');assert.equal(await root.locator('article[data-claim-id]').count(),0);assert.equal(await root.locator('[data-stat="meals"] > p').first().textContent(),'০');await context.close();
    await writeFile(`${artifacts}/checks.json`,JSON.stringify(results,null,2));
  } finally {await browser.close();}
}
