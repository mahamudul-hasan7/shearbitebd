# NGO-এর খাবার খোঁজা ও ক্লেইম

`/ngo/discover` থেকে NGO account-এর জন্য পাওয়া অনুদান দেখুন। একই filter দিয়ে
**List / Map** বদলানো যায়; refresh করলেও URL-এ নির্বাচিত শর্ত থাকে।

## খাবার বাছাই

- খাবার, দাতার নাম বা সংগ্রহের এলাকা লিখে Search চাপুন। দ্রুত category buttons,
  খাবারের ধরন, পরিমাণ, সময়সীমা, সংরক্ষণ এবং দূরত্বের filter একসঙ্গে কাজ করে।
- Desktop-এ পাশে filter থাকে। Mobile-এ **Filters** খুলুন; ফলের সংখ্যা দেখে
  **Show donations** চাপুন। Escape বা Close দিয়েও dialog বন্ধ করা যায়।
- **Recommended** আগে NGO-এর গ্রহণযোগ্য category, তারপর ২ ঘণ্টার মধ্যে সংগ্রহ
  করতে হবে এমন অনুদান, এরপর জানা সরলরেখার দূরত্ব ও সময়সীমা দেখে সাজায়। এটি কোনো
  AI score, food safety certificate বা allergy-safety guarantee নয়।
- **Why this food fits** খুললে NGO verification, গ্রহণযোগ্য category ও বর্তমান
  সময়সীমার check দেখা যায়। খাবারের নাম, donor notes ও allergen-এর লেখা অপরিবর্তিত থাকে।
- Card-এর meals সংখ্যা দাতার অনুমান। সংগ্রহের বাকি সময় হলো pickup window-এর শেষ
  সময় ও safe deadline-এর মধ্যে যেটি আগে। সময় শেষ হলে reload ছাড়াই তালিকা থেকে সরে যায়।

## অবস্থান ও ম্যাপ

NGO-এর primary address-এ pin দিলে donor-এর আনুমানিক pin থেকে সরলরেখার দূরত্ব
হিসাব হয়। **Manage address pins** থেকে ঠিকানা ঠিক করুন। দূরত্ব জানা নেই এমন অনুদান
**All distances**-এ থাকে; radius filter করলে বাদ যায়। Location অনুমান করা হয় না।
Map-এর pin অথবা পাশের donation list থেকে খাবার বাছলে নিচে একই food card দেখা যায়।
Pin না থাকলে list থেকে বাছা যায়। সফল claim-এর আগে সঠিক ঠিকানা, exact pickup
coordinates ও donor contact প্রকাশ করা হয় না। Map tiles আনতে internet প্রয়োজন।

## ক্লেইম

1. **View details & claim** খুলে ঘোষণা, storage ও allergens দেখুন।
2. **Claim donation** দিলে একটি ছোট summary খুলবে। পরিমাণ, সংগ্রহ শুরু/শেষের সময়,
   এলাকা ও allergen দেখে **Confirm claim** চাপুন। **Keep browsing** দিলে কিছু reserve হয় না।
3. এই সাধারণ discovery flow পুরো donation reserve করে; food request-এর সঙ্গে meal
   allocation করতে সংশ্লিষ্ট request-এর matching flow ব্যবহার করুন।
4. Double click-এ একটি request যায়। Server একই donation lock করে; অন্য NGO আগে
   reserve করলে বা collection window বন্ধ হলে claim গ্রহণ করে না। Response হারিয়ে
   গেলে নিজের সক্রিয় claim records দেখে ফল মিলিয়ে নেয়; ভুল করে দ্বিতীয় reservation হয় না।
5. সফল হলে **Open claim page** থেকে pickup সমন্বয়, volunteer dispatch, handover,
   delivery ও distribution-এর বর্তমান flow চালিয়ে যান।

Browser-এ Save ব্যবহার করলে শুধু ওই account-এর ওই tab-এর session-এ মনে থাকে।
Storage বন্ধ থাকলেও পাতার বাকি কাজ চলে। Automatic notification-এর কোনো অকার্যকর
switch নেই। নতুন খাবার ৩০ সেকেন্ড অন্তর বা ফিরে এলে refresh হয়; refresh ব্যর্থ হলে
আগের তালিকা ও retry বার্তা থাকে। চূড়ান্ত availability সবসময় server যাচাই করে।

## যাচাই

```sh
npm run lint
npm run typecheck
npm run build
node --import tsx --test tests/*.test.ts
npm run test:auth
npm run test:discovery:browser
```

Linux-এ প্রয়োজন হলে `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium` ব্যবহার করুন।
Tests আলাদা database schema ব্যবহার করে এবং শেষে সেটি সরিয়ে দেয়।
