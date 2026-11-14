import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { englishBrowserContext, uiLabel, uiName } from "./ui-labels.mjs";

export async function runNotificationBrowserChecks({ prisma, base, login }) {
  const artifacts = ".local-postgres/notification-ui";
  await mkdir(artifacts,{recursive:true});
  const browser = await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || undefined});
  const results=[];
  try {
    for(const role of ["DONOR","NGO","VOLUNTEER"]) {
      await prisma.notification.createMany({data:Array.from({length:8},(_,index)=>({userId:`test-${role}`,type:["CLAIM","PICKUP","DELIVERY","URGENT","IMPACT","SYSTEM","VOLUNTEER","NEARBY_DONATION"][index],title:`Visual notice ${index}`,message:index===0 ? "Food collection information and a pickup time are ready to review." : "A recorded update about your food-sharing activity.",href:role==="DONOR"?"/donor/donations":role==="NGO"?"/ngo/claims":"/volunteer/dispatches",readAt:index===7?new Date():null,createdAt:new Date(Date.now()-index*3600_000)}))});
      const {cookie}=await login(role);const [name,value]=cookie.split("=");
      for(const [width,height,language] of [[320,844,"bn"],[390,844,"en"],[844,390,"bn"],[1280,900,"en"]]) {
        const context=await englishBrowserContext(browser,{baseURL:base,viewport:{width,height}});
        await context.addInitScript(lang=>localStorage.setItem("sharebite_preferred_lang",lang),language);
        await context.addCookies([{name,value,url:base,httpOnly:true,sameSite:"Lax"}]);
        const page=await context.newPage();const errors=[];page.on("pageerror",error=>errors.push(error.message));
        const portal=role==="DONOR"?"donor":role==="NGO"?"ngo":"volunteer";
        await page.goto(`/${portal}/notifications`,{waitUntil:"networkidle"});
        const inbox=page.getByTestId("notification-center");
        await inbox.getByRole("heading",{name:"Visual notice 0",exact:true}).waitFor();
        assert.equal(await page.locator("html").getAttribute("lang"),language);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        const search=inbox.getByRole("searchbox",{name:uiLabel("Search notifications",language)});
        await search.fill("Visual notice 0");assert.equal(await inbox.locator("article").count(),1);
        await search.fill("no-match-sample");await inbox.getByRole("heading",{name:uiLabel("No matching updates",language)}).waitFor();
        await inbox.getByRole("button",{name:uiLabel("Clear notification search",language)}).click();
        await inbox.getByRole("button",{name:uiLabel("Unread",language),exact:true}).click();assert.equal(await inbox.locator('article[data-unread="false"]').count(),0);
        await inbox.getByRole("button",{name:uiLabel("All",language),exact:true}).click();
        if(width<640) {
          const toolbar=await inbox.locator(':scope > section').first().boundingBox();
          assert.ok(toolbar.height<190,"The inbox controls must stay compact on a phone");
          assert.equal(await page.getByTestId("volunteer-duty-panel").count(),0,"The notifications page should focus on the inbox");
        }
        await page.screenshot({path:`${artifacts}/${portal}-${width}-${language}.png`});
        const trigger=page.getByRole("button",{name:uiLabel("Open notifications",language),exact:true});
        await trigger.click();const dialog=page.getByRole("dialog",{name:uiLabel("Notifications",language),exact:true});await dialog.waitFor();
        assert.equal(await dialog.locator("article").count(),6);
        const viewAll=dialog.getByRole("link",{name:uiLabel("View all notifications",language),exact:true});
        const box=await viewAll.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1&&box.y>=0&&box.y+box.height<=height+1);
        await dialog.evaluate(async e=>Promise.all(e.getAnimations({subtree:true}).map(a=>a.finished)));
        const panel=await dialog.locator(':scope > div').boundingBox();
        assert.ok(panel.y<120&&panel.height<=471,"The bell should open a compact panel below the header");
        assert.equal(await dialog.evaluate(e=>getComputedStyle(e,'::backdrop').backdropFilter),"none","The quick inbox should not blur the whole page");
        await page.screenshot({path:`${artifacts}/popup-${portal}-${width}-${language}.png`,animations:"disabled"});
        await page.keyboard.press("Escape");await dialog.waitFor({state:"hidden"});
        assert.equal(await trigger.evaluate(e=>document.activeElement===e),true);
        assert.notEqual(await page.evaluate(()=>document.body.style.overflow),"hidden");
        assert.deepEqual(errors,[]);
        results.push({role,width,height,language,passed:true});
        if(role==="DONOR"&&width===390) {
          const article=inbox.locator("article").filter({has:page.getByRole("heading",{name:"Visual notice 0",exact:true})});
          const noticeId=await article.getAttribute("data-notification-id");
          await article.getByRole("button",{name:uiName("Mark read"),exact:true}).click();
          await page.waitForFunction(id=>document.querySelector(`[data-notification-id="${id}"]`)?.dataset.unread==="false",noticeId);
          assert.ok((await prisma.notification.findUnique({where:{id:noticeId}})).readAt);
          await trigger.click();const popup=page.getByRole("dialog",{name:uiName("Notifications"),exact:true});
          await popup.getByRole("button",{name:uiName("Mark all read"),exact:true}).click();
          await page.waitForFunction(()=>document.querySelector('dialog button')&&document.querySelectorAll('dialog article[data-unread="true"]').length===0);
          await page.keyboard.press("Escape");await popup.waitFor({state:"hidden"});
          assert.equal(await prisma.notification.count({where:{userId:"test-DONOR",readAt:null}}),0);
          // The event merely triggers a fetch; only this stored record may create the toast.
          const fresh=await prisma.notification.create({data:{userId:"test-DONOR",type:"DELIVERY",title:"A newly stored delivery update",message:"This notification was loaded from the server after the initial inbox.",href:"/donor/donations"}});
          await page.evaluate(()=>window.dispatchEvent(new Event("sharebite:notification")));
          const toast=page.getByRole("complementary",{name:uiName("New notification"),exact:true});await toast.waitFor();
          await toast.getByRole("heading",{name:fresh.title,exact:true}).waitFor();
          const toastBox=await toast.boundingBox();assert.ok(toastBox.x>=0&&toastBox.y>=64&&toastBox.x+toastBox.width<=width+1);
          await toast.screenshot({path:`${artifacts}/toast-${width}.png`});
          await toast.getByRole("button",{name:uiName("Close notification"),exact:true}).click();await toast.waitFor({state:"hidden"});
          await page.emulateMedia({reducedMotion:"reduce"});await trigger.click();
          assert.equal(await page.getByRole("dialog",{name:uiName("Notifications"),exact:true}).evaluate(e=>e.getAnimations({subtree:true}).length),0);
          await page.keyboard.press("Escape");
        }
        await context.close();
      }
    }
    await writeFile(`${artifacts}/checks.json`,JSON.stringify(results,null,2));
  } finally { await browser.close(); }
}
