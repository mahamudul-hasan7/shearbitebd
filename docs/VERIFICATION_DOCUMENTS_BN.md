# নথি জমা ও অ্যাডমিন review

বিশ্ববিদ্যালয়ের demo-তে নিজের বানানো **DEMO / SAMPLE** লেখা PDF অথবা ছবি ব্যবহার
করতে পারেন। অ্যাডমিন নিজে দেখে সিদ্ধান্ত নেবেন; অ্যাপ নথির সত্যতা নিজে যাচাই করে না।

## NGO ও volunteer

নতুন অ্যাকাউন্ট নিবন্ধনের সময় অনুমোদিত হয়। নিচের ধাপগুলো আগে থেকে review বাকি থাকা অ্যাকাউন্টের জন্য।

1. NGO account-এর **Verification** অথবা volunteer-এর **ID card** পাতায় যান।
2. PDF, JPG বা PNG বেছে নিন। সর্বোচ্চ 5 MB; PDF-এ ১–১০ পৃষ্ঠা থাকতে পারবে।
   ভুল format, নষ্ট ফাইল, script/form/embedded file থাকা PDF গ্রহণ করা হয় না।
3. **Submit document** দিন। বাস্তব upload progress দেখা যাবে। ব্যর্থ হলে একই ফাইল
   দিয়ে আবার চেষ্টা করা যায়; আপলোড মাঝপথে বাতিল করার ব্যবস্থাও আছে।
4. **Preview document** দিয়ে নিজের জমা দেওয়া ফাইল দেখুন বা download করুন। শুধু
   ফাইল বাছাই করলে জমা হয় না; submit করতে হবে।
5. Reject হলে **Review feedback**-এ কারণ দেখুন, সংশোধিত ফাইল দিয়ে **Submit updated
   document** দিন। Account আবার pending review হবে। অ্যাডমিন approve করলে verified হবে।

## অ্যাডমিন

সাধারণ login পাতায় `admin` / `admin123` দিয়ে ঢুকুন। **Accounts** থেকে account খুঁজে
**Review** খুলুন। জমা দেওয়া নথি preview করে অন্তত ১২ অক্ষরের কারণ লিখে approve বা
reject করুন। NGO ও volunteer-এর নতুন approval-এর জন্য জমা দেওয়া নথি প্রয়োজন।
Review history-তে আগের ফাইল ও সিদ্ধান্ত থাকবে। Review খোলা থাকা অবস্থায় নতুন ফাইল
জমা হলে পুরোনো তথ্য দিয়ে approve করা যায় না; **Reload details** দিন।

## সংরক্ষণ ও প্রবেশাধিকার

- ফাইলের bytes PostgreSQL-এ থাকে; public folder বা public URL-এ রাখা হয় না। শুধু
  account owner ও authenticated admin ফাইল দেখতে বা download করতে পারেন।
- প্রতিটি review নির্দিষ্ট file version-এর সঙ্গে যুক্ত থাকে। পুরোনো ফাইল মুছে যায় না;
  সব সংস্করণ মিলিয়ে account প্রতি সর্বোচ্চ 20 MB। সীমা পূর্ণ হলে admin-এর সঙ্গে কথা বলুন।
- ছবির metadata বাদ দিয়ে WebP হিসেবে সংরক্ষণ হয়। PDF নতুন করে তৈরি হয়; source
  annotations ও links রাখা হয় না। মূল filename UI-তে থাকে; download-এর নাম সাধারণ
  `verification-document.pdf` অথবা `verification-document.webp` হবে।
- আগে থেকেই verified account-এর verification status বদলায় না। এটি account review;
  কোনো খাবারের safety certificate নয়।

## Developer checks

```sh
npm run db:setup
npm run lint
npm run typecheck
npm run build
npm run test:auth
npm run test:verification:browser
```

Linux-এ `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium` ব্যবহার করা যায়। Browser
checks আলাদা database schema-তে NGO/volunteer registration, upload, private preview,
download, reject/resubmit, approval এবং বাংলা–ইংরেজিতে ১৬টি responsive layout পরীক্ষা করে।
