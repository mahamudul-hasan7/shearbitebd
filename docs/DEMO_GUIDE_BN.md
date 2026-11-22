# ShareBite BD — বিশ্ববিদ্যালয়ের project demonstration

এই guide-এ সংরক্ষিত database record দিয়ে তিন account-এর পুরো flow দেখানো হবে।
Admin dashboard থেকে account verification এবং operational report review করা যায়।

প্রথম update-এর সংক্ষিপ্ত rehearsal ও slide scope:
[৭ মিনিটের demo নির্দেশনা](FIRST_UPDATE_DEMO_BN.md)। Windows-এ `run-demo.bat` build করে
presentation server চালায় এবং terminal-এ current LAN URL দেখায়।

## ভাষা বেছে নেওয়া

হোমপেজ, লগইন বা অ্যাকাউন্টের উপরের `EN / বাংলা` থেকে ভাষা বেছে নিন। পাতা বদলালে
বা আবার লোড করলেও একই ভাষা থাকবে। একই ব্রাউজারের অন্য ট্যাবেও পছন্দ বদলাবে।
বাংলায় সহজ চলতি ভাষা রাখা হয়েছে—যেমন “খাবার খুঁজুন”, “পরের ধাপ”, “সমস্যা জানান”।
নিজের দেওয়া নাম, ঠিকানা, খাবারের বিবরণ বা সমস্যার কথা ভাষা বদলালেও বদলাবে না।
নিচের নির্দেশনার বাটনগুলোও আপনার বেছে নেওয়া ভাষায় দেখা যাবে।

## ১. প্রস্তুতি

1. Terminal-এ project directory থেকে `npm run db:local:status` চালান। প্রয়োজন হলে
   `npm run db:local:start` দিন। কাজ করার সময় `npm run dev` ব্যবহার করুন।
   ক্লাসে বা মোবাইলে ডেমো দেখানোর আগে dev server বন্ধ করে `npm run build`, তারপর
   `npm run demo` দিন। এতে পেজ খোলার সময় আবার compile করতে হবে না। কোড বদলালে
   ডেমো server বন্ধ করে আবার build করতে হবে। App: http://localhost:3000।
   বাংলা–ইংরেজির ফন্ট প্রজেক্টেই আছে; ফন্ট দেখাতে Google-এর সংযোগ লাগে না।
2. Donor, NGO ও volunteer-এর জন্য আলাদা browser profile/private session ব্যবহার করুন।
   একই browser-এর সাধারণ tab-গুলো একই login cookie ব্যবহার করে।
3. নিজের তিনটি account register করুন বা বিদ্যমান account ব্যবহার করুন। Guide কোনো
   account-এর password প্রকাশ করে না। Owner-এর নির্দেশে password hashing এখনও স্থগিত।
4. অ্যাডমিন account দিয়ে `/login` থেকে ঢুকে **Verification Requests** পাতায় নতুন account যাচাই করুন।
   Local admin-এর username `admin` এবং password `admin123`।
   বিস্তারিত [অ্যাডমিন গাইডে](ADMIN_GUIDE_BN.md) আছে। NGO ও volunteer register করার পর DEMO / SAMPLE লেখা PDF বা ছবি জমা দিন।
   Admin-এর Verification Requests থেকে ফাইল preview করে approve/reject করুন।
   Account approval কোনো food safety certificate নয়।

খাবার খোঁজা, filter, map ও claim confirmation দেখানোর জন্য
[NGO discovery নির্দেশনা](NGO_DISCOVERY_BN.md) অনুসরণ করুন।

তিন account-এর pickup, delivery ও distribution demo-র জন্য
[Rescue coordination নির্দেশনা](RESCUE_COORDINATION_BN.md) দেখুন।

## ২. Location ও খাবার প্রকাশ — donor

1. `/donor/addresses` থেকে ঠিকানার `Set location pin` খুলুন। Map-এ click/drag,
   device location, অথবা latitude/longitude দিয়ে `Apply coordinates` করুন। এরপর save।
2. `/donor/donations/new` থেকে খাবারের নাম, category, quantity, preparation time,
   pickup window ও deadline দিন। Demo চলাকালে deadline অতিক্রম হবে না এমন সময় দিন।
3. বাস্তবে যে খাবার দেখাচ্ছেন তার ছবি দিন। ছবি না দিলে neutral “Photo not provided”
   দেখাবে। বিকল্প হিসেবে Packed meals বা Meal trays sample বেছে নিতে পারেন;
   সেটি “Sample image · উদাহরণ ছবি” label-সহ দেখাবে। নিজের ছবি upload করলে sample
   selection সরে যাবে। Sample ছবি actual upload/evidence হিসেবে গণনা হবে না।
   Form-এর পরিবর্তন browser session-এর account-scoped draft-এ auto-save হয়।
4. নিজের saved pickup address ও contact বেছে declaration পড়ে publish করুন।
5. Donation detail reload করুন। একই ID, ছবি ও তথ্য থাকছে দেখান।

## ৩. Request ও claim — NGO

1. `/ngo/addresses` থেকে delivery pin save করে প্রয়োজনীয় ঠিকানাকে primary করুন।
2. `/ngo/discover/map`-এ donor-এর আনুমানিক location দেখান। ৫ কিমি filter ব্যবহার
   করতে NGO primary address এবং donation—দুটিরই pin থাকতে হবে। `All` দিলে missing
   distance-এর donation-ও তালিকায় থাকবে। Distance হলো আনুমানিক সরাসরি দূরত্ব।
3. সম্পূর্ণ request flow দেখাতে `/ngo/requests/new` থেকে প্রয়োজন, meal count,
   compatible category/diet, deadline ও saved delivery address দিয়ে publish করুন।
4. Request details-এর suitable donations থেকে compatible খাবার reserve করুন।
   Allergen restriction থাকলে declaration দেখে acknowledgement দিন।
5. বিকল্পভাবে discovery থেকে direct claim করা যায়। Request fulfillment দেখাতে
   request-এর সাথে linked claim ব্যবহার করুন।
6. Claim-এর পরে exact pickup address/contact/pin খুলেছে দেখান। শুধু reserve করায়
   request fulfilled হয় না—এটি distribution-এর পরে হিসাব হবে।

## ৪. Pickup ও delivery — তিন account

1. Volunteer `/volunteer/dispatches` পাতার ওপরে `ডিউটি অন/অফ` সুইচ থেকে ডিউটি
   ON করবেন। নতুন অ্যাকাউন্ট শুরুতে OFF থাকে; অ্যাকাউন্ট যাচাই শেষ হলে ON করা যায়।
   তারপর সঠিক mission-এ `Accept mission` চাপবেন। অন্য active mission থাকলে আগে
   সেটি শেষ করতে হবে। OFF অবস্থায় তালিকা দেখা যাবে, নতুন মিশন নেওয়া যাবে না।
2. Assigned mission-এ saved pickup/delivery pin ও navigation link দেখান।
3. Donor donation detail-এ pickup code generate করবেন। হাতে খাবার নেওয়ার সময়
   assigned volunteer ছয় সংখ্যার code দিয়ে `Confirm pickup` করবেন।
4. NGO claim detail-এ delivery code generate করবেন। পৌঁছানোর সময় volunteer
   code দিয়ে `Confirm delivery` করবেন। একই code আবার ব্যবহার করা যাবে না।
5. Code expire বা attempt limit হলে issuer-এর কাছ থেকে replacement নিন। এক মিনিটের
   generation cooldown থাকলে অপেক্ষা করুন। Code কেবল সংশ্লিষ্ট handover-এর সময় দিন।

ডিউটি OFF করলেও চলমান মিশন বাতিল হবে না—পিকআপ ও ডেলিভারি শেষ করা যাবে।
পাতা reload করলে বা আবার login করলেও সেভ করা ON/OFF অবস্থা থাকবে। ডিউটির সুইচটি
এখন পাতার ওপরের এক জায়গায়; নিচে আলাদা ভাসমান ডিউটি বার নেই।

## ৫. Receipt, distribution ও impact — NGO

1. Claim থেকে `Record delivery receipt` খুলে পাওয়া quantity, condition ও ছবি দিন।
2. `Record distribution` থেকে actual people/meals, সময়, consent ও ঠিকানা দিন।
   Request-linked rescue হলে request-এর ঘোষিত ঠিকানা ব্যবহার করুন।
3. Submit ও reload করে record দেখান। Request-এর fulfilled meals actual distribution
   থেকে বাড়বে; donor/NGO impact এবং volunteer history-তেও সংরক্ষিত তথ্য দেখাবে।
4. Volunteer delivery handover count এবং NGO distributed meal count আলাদা। NGO
   distribution দেওয়ার আগে delivered quantity-কে বিতরণকৃত meal হিসেবে ধরা হবে না।

## ৬. আলাদাভাবে error handling দেখানো

- Donor/NGO/assigned volunteer rescue details থেকে issue report ও বাস্তব evidence
  দিতে পারেন। চলমান rescue-এ report দিলে progression থামে; operator review ছাড়া
  resume হয় না। Happy-path demo শেষ করে আলাদা rescue-এ এটি দেখানো সহজ।
- ভুল account থেকে অন্যের record খোলা, ভুল OTP বা duplicate claim server reject করে।
- Notification page-এ actual notification/read status দেখান। Network failure-এ error
  দেখাবে; request ব্যর্থ হলে মিথ্যা “read/saved” success দেখাবে না।
- Device GPS-এর জন্য permission ও HTTPS/localhost দরকার। Mobile LAN URL-এ manual
  pin/coordinates ব্যবহার করুন। Map tiles ও Google Maps-এর জন্য internet প্রয়োজন।

## কী দাবি করবেন

Database persistence, role/ownership checks, food request matching, coordinate
snapshots, transactional claims, OTP handovers, real photo uploads, incident holds,
receipt/distribution এবং actual meal records কাজ করে।

Food safety testing, temperature sensors, live volunteer GPS, measured road ETA,
government certificates, university credits, SMS/push/email delivery, team invitations,
support ticket inbox ও password reset এখনও যুক্ত হয়নি। Public
planning calculator উদাহরণভিত্তিক; account-এর actual impact নয়।

## Automatic checks

```powershell
npm run lint
npm run typecheck
npm run build
npm run test:auth
npm run test:photos:browser
npm run test:incidents:browser
npm run test:requests:browser
npm run test:maps:browser
npm run test:cleanup:browser
npm run test:samples:browser
```

Browser commands Windows-এ installed Microsoft Edge ব্যবহার করে। Test data আলাদা
random PostgreSQL schema-তে থাকে; মূল account/donation record পরিবর্তন করে না।
Screenshots gitignored `.local-postgres/`-এর সংশ্লিষ্ট `*-browser` directory-তে পাওয়া যাবে।

Admin-এর নতুন **Verification Requests** এবং **All Users** দিয়ে আলাদা কাজ করুন।
Ban/Unban/Delete ও history সংরক্ষণের নিয়ম: [ইউজার নিয়ন্ত্রণ](ADMIN_USER_CONTROLS_BN.md)।
