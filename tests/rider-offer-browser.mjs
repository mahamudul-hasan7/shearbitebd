import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { uiLabel } from "./ui-labels.mjs";

export async function runRiderOfferBrowserChecks({prisma,base,dutyRider,dutyClaim,jsonResult}) {
  const artifacts=".local-postgres/rider-offer";await mkdir(artifacts,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,channel:process.env.PLAYWRIGHT_CHANNEL || undefined});const results=[];
  const expireOpen = () => prisma.donation.updateMany({where:{status:"RESERVED"},data:{safePickupDeadline:new Date(Date.now()-60_000)}});
  try {
    for(const [width,height,language] of [[320,844,"bn"],[390,844,"en"],[844,390,"bn"],[1280,900,"en"]]) {
      await expireOpen();
      const rider=await dutyRider();const first=await dutyClaim();
      const context=await browser.newContext({baseURL:base,viewport:{width,height}});await context.addInitScript(lang=>localStorage.setItem("sharebite_preferred_lang",lang),language);
      const [name,value]=rider.cookie.split("=");await context.addCookies([{name,value,url:base,httpOnly:true,sameSite:"Lax"}]);
      const page=await context.newPage();const errors=[];page.on("pageerror",error=>errors.push(error.message));
      const t=source=>uiLabel(source,language);
      const popup=page.getByTestId("rider-incoming-offer");
      await page.goto("/volunteer/id-card",{waitUntil:"networkidle"});
      assert.equal(await popup.count(),0,"Duty OFF must not show a job offer");
      await page.getByRole("button",{name:t("Open account menu"),exact:true}).click();
      const duty=page.getByRole("switch",{name:t("Duty ON/OFF"),exact:true});await duty.click();
      await popup.waitFor();assert.equal(await popup.getAttribute("data-dispatch-id"),first.claim.id);
      assert.equal(await popup.getByText("01712345670",{exact:true}).count(),0,"Private contact details remain hidden before assignment");
      const accept=popup.getByRole("button",{name:t("Take this delivery"),exact:true});
      const box=await accept.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1&&box.y>=0&&box.y+box.height<=height+1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await popup.evaluate(async e=>Promise.all(e.getAnimations({subtree:true}).map(a=>a.finished)));
      await page.screenshot({path:`${artifacts}/offer-${width}-${language}.png`,animations:"disabled"});
      await popup.getByRole("button",{name:t("Not now; keep it in the list"),exact:true}).click();await popup.waitFor({state:"hidden"});
      assert.equal((await prisma.claim.findUnique({where:{id:first.claim.id}})).status,"RESERVED","Not now only dismisses this rider's prompt");
      await page.reload({waitUntil:"networkidle"});assert.equal(await popup.count(),0,"A dismissed job must not keep popping up after reload");
      const next=await dutyClaim();
      await popup.waitFor({timeout:9000});assert.equal(await popup.getAttribute("data-dispatch-id"),next.claim.id,"New server work appears through polling on a profile page");
      let target=next;
      if(width===320) {
        await context.route("**/api/dispatches",async route=>{if(route.request().method()==="POST")await route.fulfill({status:500,json:{error:"Mission could not be assigned."}});else await route.continue();});
        await accept.click();await popup.getByRole("alert").waitFor();
        assert.equal((await prisma.claim.findUnique({where:{id:next.claim.id}})).status,"RESERVED");
        await context.unroute("**/api/dispatches");
      }
      if(width===390) {
        const other=await dutyRider();await jsonResult("/api/volunteer/duty",{cookie:other.cookie,method:"PATCH",body:{isOnDuty:true}});
        await jsonResult("/api/dispatches",{cookie:other.cookie,method:"POST",body:{claimId:next.claim.id}});
        await page.evaluate(()=>window.dispatchEvent(new Event("sharebite:rider-offers-refresh")));
        await popup.getByRole("heading",{name:t("This job is no longer available"),exact:true}).waitFor();assert.equal(await accept.isDisabled(),true);
        await popup.getByRole("button",{name:t("Got it"),exact:true}).click();await popup.waitFor({state:"hidden"});
        target=await dutyClaim();await page.evaluate(()=>window.dispatchEvent(new Event("sharebite:rider-offers-refresh")));await popup.waitFor();assert.equal(await popup.getAttribute("data-dispatch-id"),target.claim.id);
      }
      if(width===844) {
        await jsonResult("/api/volunteer/duty",{cookie:rider.cookie,method:"PATCH",body:{isOnDuty:false}});await page.evaluate(()=>window.dispatchEvent(new Event("focus")));await popup.waitFor({state:"hidden"});
        assert.equal((await prisma.claim.findUnique({where:{id:next.claim.id}})).status,"RESERVED");
        await jsonResult("/api/volunteer/duty",{cookie:rider.cookie,method:"PATCH",body:{isOnDuty:true}});await page.evaluate(()=>window.dispatchEvent(new Event("focus")));await popup.waitFor();
      }
      if(width===1280) {await page.emulateMedia({reducedMotion:"reduce"});await popup.getByRole("button",{name:t("Not now; keep it in the list"),exact:true}).click();await popup.waitFor({state:"hidden"});target=await dutyClaim();await page.evaluate(()=>window.dispatchEvent(new Event("sharebite:rider-offers-refresh")));await popup.waitFor();assert.equal(await popup.evaluate(e=>e.getAnimations({subtree:true}).length),0);}
      let posts=0;page.on("request",request=>{if(request.url()===base+"/api/dispatches"&&request.method()==="POST")posts++;});
      await accept.evaluate(button=>{button.click();button.click();});
      await page.waitForURL(`${base}/volunteer/missions/mission-${target.claim.id}`);
      assert.equal(posts,1,"Repeated taps only send one acceptance");
      const saved=await prisma.claim.findUnique({where:{id:target.claim.id}});assert.equal(saved.volunteerProfileId,rider.user.volunteerProfile.id);assert.equal(saved.status,"ASSIGNED");
      await dutyClaim();await page.goto("/volunteer/notifications",{waitUntil:"networkidle"});assert.equal(await popup.count(),0,"A rider with an active mission must not get another offer");
      assert.deepEqual(errors,[]);results.push({width,height,language,polling:true,dismissal:true,acceptance:true,passed:true});await context.close();
    }
    await expireOpen();await dutyClaim();const pending=await dutyRider(false);await prisma.volunteerProfile.update({where:{userId:pending.user.id},data:{verificationStatus:"REJECTED"}});const context=await browser.newContext({baseURL:base});const [name,value]=pending.cookie.split("=");await context.addCookies([{name,value,url:base,httpOnly:true,sameSite:"Lax"}]);const page=await context.newPage();await page.addInitScript(()=>localStorage.setItem("sharebite_preferred_lang","en"));await page.goto("/volunteer/id-card",{waitUntil:"networkidle"});await page.getByRole("button",{name:"Open account menu",exact:true}).click();assert.equal(await page.getByTestId("rider-incoming-offer").count(),0);assert.equal(await page.getByRole("switch").isEnabled(),true);await context.close();
    await writeFile(`${artifacts}/checks.json`,JSON.stringify(results,null,2));
  } finally {await browser.close();}
}
