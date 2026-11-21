# তিন account-এ উদ্ধারকাজের সমন্বয়

Donor tracking, NGO claim এবং volunteer mission পাতায় একই database checkpoints
ব্যবহার হয়। **Next in this rescue** অংশে নিজের account-এর পরের দায়িত্ব দেখা যায়।
Progress সাধারণত ৫ সেকেন্ড অন্তর, tab-এ ফিরে এলে অথবা Refresh দিলে নতুন হয়।

## ডেমো flow

1. Donor খাবার প্রকাশ করুন; NGO discovery থেকে claim করুন। যাচাই করা ও duty ON
   থাকা volunteer dispatch গ্রহণ করলে তিন account-এ assignment দেখা যাবে।
2. Volunteer mission খুলে **Start pickup trip**, তারপর ঠিকানায় পৌঁছে **I have
   arrived at pickup** দিন। শুরুতেই OTP form দেখানো হয় না।
3. Donor tracking-এর **Pickup handover code** থেকে code তৈরি করুন। খাবার বুঝিয়ে
   দেওয়ার সময় শুধু নির্ধারিত volunteer-কে দিন। Volunteer code দিলে pickup যাচাই হয়।
4. Volunteer **Start delivery trip** দিন। NGO claim পাতায় খাবার পৌঁছানোর সময়
   **Delivery handover code** তৈরি করুন। Volunteer আলাদা delivery code দিয়ে হস্তান্তর শেষ করবেন।
5. NGO-এর পরের action হবে **Record delivery receipt**। প্রাপ্ত পরিমাণ ও অবস্থা
   সংরক্ষণ করলে পরের action হবে **Record distribution**। বিতরণ হয়ে গেলে প্রকৃত
   খাবার ও মানুষের সংখ্যা দিয়ে Complete rescue করুন।
6. Donor ও NGO-তে Food distributed দেখা যাবে। Volunteer-এ delivery handover শেষ
   থাকবে। শুধু delivery করলে meals-served/beneficiary impact তৈরি হয় না।

## Code, নিরাপত্তা ও error

- Code server তৈরি করে এবং নির্দিষ্ট handover-এর জন্য একবার ব্যবহারযোগ্য। সর্বোচ্চ
  ১০ মিনিট; collection/safe deadline আগে হলে সেই সময় পর্যন্তই কার্যকর। Owner-এর
  screen-এ server expiry থেকে বাকি সময় দেখা যায়।
- Replacement-এর জন্য server cooldown মানতে হয়। অন্য tab/device থেকে replacement
  হলে আগের tab-এর code আর দেখানো হয় না, এমনকি দুই code-এর expiry একই থাকলেও।
- Code শুধু তৈরি করা owner-এর screen-এ আসে। সাধারণ claim/mission GET-এ code বা
  digest থাকে না। ভুল code-এর attempt server-এ সংরক্ষিত হয়; lock হলে নতুন code চান।
- Issue/verify/stage/release double click-এর জন্য client guard থাকে। Server-এর
  authorization, claim lock, expiry ও incident checks-ও বহাল থাকে।
- নতুন তথ্য না এলে আগের progress থাকে, animation থামে এবং retry দেখা যায়। Volunteer
  stale mission থেকে নতুন action নিতে পারেন না। Code panel নিজের fresh status যাচাই করে।
- Incident hold হলে next-step progress/code action বন্ধ থাকে। Admin review ছাড়া
  সাধারণ participant hold সরাতে পারেন না। পুরোনো checkpoints মুছে যায় না।

## Map ও যোগাযোগ

প্রয়োজন হলে **Map & saved handover locations** খুলুন। Directions link সংরক্ষিত
pin থেকে তৈরি হয়। Map tiles-এর জন্য internet লাগে; pin না থাকলে ঠিকানা/ফোন ব্যবহার
করুন। **Live GPS, speed, temperature বা arrival estimate মাপা হচ্ছে না।**
Volunteer-এর cancelled/expired mission-এ private location ও contact আগের নিয়মে
সরিয়ে দেওয়া হয়। Donor tracking-এ relisted food-এর পুরোনো cancelled receiver-কে
চলমান claim হিসেবে দেখানো হয় না।

Mission পাতায় বর্তমান কাজ সামনে থাকে; duty controls dispatch/dashboard-এ পাওয়া যায়।
Duty OFF করলেও আগের active mission শেষ করার নিয়ম বদলায় না।

## Checks

```sh
npm run lint
npm run typecheck
npm run build
node --import tsx --test tests/*.test.ts
npm run test:auth
npm run test:coordination:browser
npm run test:progress:browser
```

Linux-এ প্রয়োজন হলে `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium` দিন। Tests
আলাদা database schema-তে চলে; আপনার app-এর সংরক্ষিত record বদলায় না।
