# Admin-এর ইউজার নিয়ন্ত্রণ

সাধারণ Login page-এ স্থানীয় ডেমোর `admin` / `admin123` দিয়ে লগইন করুন।
নেভিগেশনে দুটি আলাদা জায়গা আছে:

- **Verification** → **Verification Requests** (`/admin/verifications`): নতুন বা
  pending Donor, NGO, Volunteer-এর তথ্য ও নথি দেখে Approve/Reject করুন। Rejected
  filter-এ প্রত্যাখ্যাত আবেদন দেখা যায়। NGO/Volunteer approval-এ জমা দেওয়া বর্তমান
  নথি লাগে। এই পেজে Ban/Delete নেই। পুরোনো `/admin/accounts` ঠিকানা এখানেই পাঠায়।
- **All Users** (`/admin/users`): সব বর্তমান Donor, NGO, Volunteer-এর নাম,
  প্রতিষ্ঠান, ইমেইল বা ফোন দিয়ে খুঁজুন। Role ও account access filter আছে। Manage
  খুলে verification ও access আলাদা badge-এ দেখুন। Admin account এখানে থাকে না।

## Ban / Block ও Unban

Ban আর Block এখানে একই কাজ: কারণ (অন্তত ১২ অক্ষর) লিখে **Confirm ban** দিলে
সেই account-এর সব session সঙ্গে সঙ্গে বাতিল হয়। আবার login করা যায় না।
Volunteer-এর duty-ও OFF হয়। Verification ও আগের rescue record বদলায় না।
Ban করার আগে দেখানো active rescue count দেখে চলমান কাজের ব্যবস্থা করুন।
Banned donor-এর unclaimed খাবার discovery/matches-এ এবং banned NGO directory-তে
দেখানো হয় না। নতুন dispatch-এ unavailable participant থাকলে গ্রহণ করা যায় না।

**Unban** করলে account আবার নতুন করে login করতে পারে। পুরোনো token কাজ করবে
না; volunteer-কে আবার duty ON করতে হবে। Verification নিজে থেকে অনুমোদিত হয় না।

## Delete account

Manage → Delete account → কারণ লিখুন → বড় অক্ষরে `DELETE` লিখুন →
**Delete permanently**। RESERVED, ASSIGNED, PICKED_UP, DELIVERED বা DISPUTED
rescue থাকলে server delete করতে দেবে না। আগে সংশ্লিষ্ট rescue নিষ্পত্তি করুন।
পরীক্ষাটি transaction-এর ভেতর হয়; একই সময়ে নতুন claim হলেও history নষ্ট হয় না।

Delete করলে login স্থায়ীভাবে বন্ধ হয়, password ও অনন্য login পরিচয় ছাড়িয়ে দেওয়া
হয়, এবং সব session বাতিল হয়। উন্মুক্ত donor post ও NGO food request CANCELLED হয়।
মূল account row, নাম, যোগাযোগের তথ্য, profile, donation/claim, document ও review
history থাকে—এটি ব্যক্তিগত তথ্য সম্পূর্ণ মুছে দেওয়ার ব্যবস্থা নয়। আগের record
ঠিক রাখতে স্থায়ী account tombstone ব্যবহার হয়; Unban দিয়ে ফেরানো যায় না।
একই email/phone দিয়ে পরে নতুন account করলে সেটির আলাদা পরিচয় ও নতুন verification
লাগবে। **Deleted accounts** filter-এ পুরোনো account ও action history দেখা যায়।

প্রতি action-এ admin-এর নাম, সময় ও কারণ সংরক্ষিত হয়। পুরোনো details দিয়ে action
দিলে Reload করতে বলা হয়। একই submission retry করলে দ্বিতীয়বার action হয় না।

## যাচাই

```bash
npm run db:setup
npm run build
npm run test:auth
npm run test:admin-users:browser
npm run test:admin:browser
```

Browser tests আলাদা random database schema ব্যবহার করে। Linux-এ প্রয়োজন হলে
`PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium` দিন। Screenshots ও ফলাফল gitignored
`.local-postgres/admin-users-browser/`-এ থাকে। Desktop ও mobile, বাংলা ও ইংরেজি,
Ban/Unban, typed Delete confirmation এবং active-rescue guard যাচাই হয়।
