# প্রথম update: ৭ মিনিটের demo

লক্ষ্য: একই server-এ Donor → NGO → Rider → receipt/distribution-এর সংরক্ষিত flow
দেখানো। UI, map, bilingual copy, deadline এবং handover কীভাবে একসঙ্গে কাজ করে তা
দেখাবেন। Nearby rider matching পরের increment; বর্তমান dispatch-এ rider নিজে কাজ বেছে নেন।

## ক্লাসের আগে

1. পুরোনো dev/demo server বন্ধ করে Windows-এ `run-demo.bat` খুলুন। এটি existing
   startup/setup ব্যবহার করে নতুন production build বানাবে এবং ready হলে browser খুলবে।
   Build শেষ হওয়া পর্যন্ত অপেক্ষা করুন; এই সময় presentation শুরু করবেন না। অন্য OS-এ
   `npm run build`, তারপর `node scripts/start-and-open.mjs --demo` দিন।
2. Terminal-এর `[LAN]` থেকে কম্পিউটারের Wi-Fi/Ethernet address ও port নিন। একই Wi-Fi-র
   ফোনে সেই URL দিন। ফোনে `localhost` দেবেন না। সব device একই server ব্যবহার করবে।
   একাধিক network/VPN address দেখালে নিজের বর্তমান Wi-Fi/Ethernet-এরটি ব্যবহার করুন।
3. তিনটি আলাদা device বা browser profile-এ Donor, NGO ও Rider login করে রাখুন। সাধারণ
   tab-গুলো login cookie ভাগ করে। তাদের header-এ যথাক্রমে সবুজ Donor, নীল NGO ও কমলা
   Rider পরিচয় দেখুন। নিজের account-এর password ব্যবহার করুন।
4. NGO ও Rider-এর document আগেই জমা দিয়ে Admin-এর **Verification Requests** থেকে
   approve করুন। Admin login: `admin` / `admin123` (local demo)। All Users হলো
   ban/unban/delete-এর জায়গা। মূল demo-র সময় account মুছবেন না।
5. Donor-এর pickup address ও NGO-এর primary delivery address-এ manual map pin save
   করুন। LAN HTTP-তে GPS permission না চললেও manual pin ব্যবহার করা যায়। Map tiles
   ও external navigation-এর জন্য internet লাগে; text address/contact fallback আছে।
6. নিজের demo account-এ `DEMO — Meal boxes` নামে ২০ meals-এর draft প্রস্তুত রাখুন।
   Preparation, pickup window ও deadline বর্তমান সময় অনুযায়ী দিন; rehearsal-এর পরে
   পুরোনো draft-এর সময় আবার দেখুন। এটি presentation-এর নমুনা data বলে উল্লেখ করুন।

## দেখানোর ক্রম

| সময় | কে / কাজ | কী প্রমাণ হবে |
| --- | --- | --- |
| ০:০০–০:৪০ | সমস্যা ও তিন role-এর পরিচয় | একই rescue-তে আলাদা দায়িত্ব |
| ০:৪০–১:৪৫ | Donor draft review করে publish, detail reload | Validation, deadline ও database persistence |
| ১:৪৫–২:৪৫ | NGO নাম দিয়ে খোঁজে, map/৫ কিমি filter দেখায়, confirmation দিয়ে claim | Saved pin-এর distance, একবার claim, তারপর exact address access |
| ২:৪৫–৪:৪৫ | Rider duty ON, সঠিক job accept, pickup trip/arrival, Donor pickup OTP, delivery trip ও NGO delivery OTP | সংরক্ষিত stage, দুই আলাদা ছয়-সংখ্যার code ও তিন account-এ progress |
| ৪:৪৫–৫:৪৫ | NGO received quantity/condition save, ১০ meals ও ৫ people-এর distribution record | Delivery আর actual distribution আলাদা হিসাব |
| ৫:৪৫–৬:৩০ | তিন account-এর detail/dashboard/history reload | একই rescue, recorded meal total ও verified delivery থাকে |
| ৬:৩০–৭:০০ | প্রশ্ন ও সংক্ষিপ্ত architecture ব্যাখ্যা | Next.js API → Prisma/PostgreSQL; maps ও polling-backed UI |

Pickup OTP দেওয়ার সময় একবার ভুল ছয়-সংখ্যার code দিয়ে error দেখাতে পারেন, তারপর
আসল code দিয়ে এগোন। ভুল code-এর পাঁচটি attempt সীমা আছে; demo-তে বারবার ভুল দেবেন না।
Code কেবল সংশ্লিষ্ট issuer-এর issue response-এ দেখা যায়। Code হারালে cooldown শেষে
replacement দিন। এটি অন্য account-এর OTP দেখিয়ে দেওয়ার shortcut নয়।

## কোথাও আটকে গেলে

- **Job নেই:** NGO claim হয়েছে কি না, খাবারের deadline/window খোলা আছে কি না দেখুন।
- **Accept বন্ধ:** Rider verified ও duty ON কি না; অন্য active mission আছে কি না দেখুন।
- **View বদলাচ্ছে না:** একই rescue ID দেখছেন কি না দেখুন; refresh/retry দিন। Refresh
  করলে saved stage থেকে এগোবেন। একই browser profile-এ অন্য account login করবেন না।
- **Distribution বন্ধ:** Delivery OTP verified, receipt saved, received condition উপযুক্ত
  ও deadline খোলা থাকতে হবে। Entry-র actual count/consent/address ঠিক করুন।
- **Port busy:** আগের server window বন্ধ করুন। অন্য port চাইলে launcher চালানোর আগে
  Windows terminal-এ `set PORT=3001` দিন; প্রদর্শিত নতুন LAN URL ব্যবহার করুন।

## Slide-এ যে দাবি রাখবেন

Listing, saved-location map/filter, transactional claim, rider duty/assignment,
দুই ধাপের ৬-digit OTP, incident reporting, receipt/distribution, admin verification ও
বাংলা/ইংরেজি UI দেখাতে পারবেন। Actual distribution-এর আগে বিতরণকৃত meal দাবি করবেন না।

Countdown donor-declared deadline-এর; এটি AI food-safety prediction নয়। Background
push, QR scanning, rider GPS/automatic nearby matching, measured road ETA, gamification
credits ও campus trial সম্পূর্ণ না হলে roadmap/planned হিসেবে দেখান। Statistics ও
food-safety policy-এর পাশে source/year ও প্রযোজ্য শর্ত দিন; ১০০ms load বা ৩০ মিনিটে
delivery measurement ছাড়া achieved result হিসেবে বলবেন না।

## Automated rehearsal

Database চালু ও production build তৈরি করে চালান:

```sh
npm run test:first-update:browser
```

এটি actual demo launcher দিয়ে non-loopback HTTP server খোলে এবং তিনটি isolated
account session-এ post → claim → assign → pickup/delivery OTP → receipt → distribution
পরীক্ষা করে। বাংলা/ইংরেজি responsive layouts, ভুল OTP, duplicate actions, failed save,
stale recovery ও receipt retry অন্তর্ভুক্ত। Launcher-এর actual LAN port এবং stop-এর
পরে server বন্ধ হয় কি না-ও পরীক্ষা হয়। Browser-এর security rules বন্ধ করা হয় না।

এগুলো simulated browser/device checks। নিজের presentation laptop ও ফোনগুলোতে উপরের
৭ মিনিটের sequence একবার চালিয়ে শেষ rehearsal করুন। Test data আলাদা temporary
PostgreSQL schema-তে থাকে; নিজের account/data-তে এই automated test লিখবে না।
