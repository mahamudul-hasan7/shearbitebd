# অ্যাডমিন ড্যাশবোর্ড

`run-project.bat` চালালে নতুন migration স্বয়ংক্রিয়ভাবে প্রয়োগ হয়। পুরোনো database
মুছে ফেলা হয় না। Terminal থেকে চালালে প্রথমে `npm run db:setup` দিন।

## প্রবেশ করুন

নিজের local PostgreSQL database-এ প্রথম setup-এর সময় একটি ADMIN account তৈরি হয়।
Email ও random password terminal-এ একবার দেখানো হয় এবং `.local-postgres/admin-access.json`
ফাইলে রাখা হয়। এই ফাইল private এবং Git-এ যায় না। সেটি কারও সঙ্গে শেয়ার করবেন না।
কোনো সক্রিয় admin আগে থেকেই থাকলে তার password বা account বদলানো হয় না।

সাধারণ `/login` পাতা থেকে admin-এর email ও password দিয়ে ঢুকলে `/admin/dashboard`
খুলবে। Public registration দিয়ে ADMIN account তৈরি করা যায় না। External database-এ
এই script নিজে থেকে admin তৈরি করে না। সেখানে database owner-কে আলাদাভাবে admin
account প্রস্তুত করতে হবে।

## প্রয়োজনীয় কাজ

- **Overview** — যাচাই বাকি অ্যাকাউন্ট, চলমান উদ্ধার, অমীমাংসিত অভিযোগ এবং এনজিওর
  নথিতে বিতরণকৃত মোট খাবার। সংখ্যাগুলো database থেকে আসে।
- **Accounts** — নাম, প্রতিষ্ঠান বা email দিয়ে খুঁজুন। ভূমিকা ও অবস্থা দিয়ে filter করুন।
  বিস্তারিত দেখে অন্তত ১২ অক্ষরের কারণসহ অনুমোদন বা প্রত্যাখ্যান করুন। সিদ্ধান্ত,
  অ্যাডমিনের পরিচয় ও সময় একসঙ্গে সংরক্ষিত হয় এবং account owner নোটিফিকেশন পান।
  Verified account বাতিল করার ক্ষমতা এই verification form-এ নেই।
- **Rescues** — চলমান ও পুরোনো উদ্ধার দেখুন। বিস্তারিত অংশে সংশ্লিষ্ট যোগাযোগ,
  সংগ্রহস্থল, সংরক্ষিত গন্তব্য এবং নিরাপদ সংগ্রহের শেষ সময় দেখুন।
- **Reports** — অভিযোগ ও প্রমাণ দেখে review শুরু, সমাধান করে resume, খাবার বাতিল বা
  সমাধানকৃত অভিযোগ close করুন। স্থগিত উদ্ধার চালু করার আগেও বিদ্যমান deadline,
  ক্ষতিগ্রস্ত খাবার এবং অন্য unresolved report-এর বাধা পরীক্ষা হয়।

নথির নাম দেখানো মানে মূল নথি upload করা আছে এমন নয়। মূল নথি আলাদাভাবে যাচাই
করতে হবে। Account approval কোনো খাবারের safety certificate নয়।

একই account-এর verification profile অন্য admin বা account owner বদলে ফেললে পুরোনো তথ্য দিয়ে সিদ্ধান্ত
সংরক্ষণ করা যাবে না। **Reload details** দিয়ে নতুন তথ্য দেখুন। **Refresh** বর্তমান
পাতার সংখ্যা ও তালিকা হালনাগাদ করে। Desktop-এ বাম পাশের menu এবং mobile-এ নিচের
চারটি navigation item একই কাজ করে। Keyboard, Escape দিয়ে dialog বন্ধ এবং reduced
motion preference সমর্থিত।

## যাচাই

```sh
npm run typecheck
npm run test:i18n
npm run build
npm run test:auth
npm run test:admin:browser
```

Linux-এ প্রয়োজন হলে `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium` দিন। Windows-এ
browser test ডিফল্টভাবে Microsoft Edge ব্যবহার করে। Test আলাদা random database
schema-তে চলে এবং শেষে সেটি মুছে দেয়। আপনার app-এর public schema রাখা হয়।
