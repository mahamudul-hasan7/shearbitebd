# Donor → NGO → Volunteer UX review

২২ নভেম্বর ২০২৬-এ `bd5c8a4` revision থেকে পরীক্ষা শুরু। এই review-এর লক্ষ্য হলো
খাবার প্রকাশ থেকে প্রকৃত বিতরণ পর্যন্ত ব্যবহারকারী যেন পরের কাজ বুঝতে পারেন,
ভুল ঠিক করে এগোতে পারেন এবং সংরক্ষিত কাজ আবার জমা দিতে না হয়।

## যে জায়গাগুলো উন্নত করা হয়েছে

| জায়গা | আগে | এখন |
| --- | --- | --- |
| Donor প্রকাশের পর | SMS/QR ও নির্দিষ্ট সংগঠনের উল্লেখ; safety verified badge | অ্যাপের notification, tracking, নির্ধারিত volunteer-এর pickup code এবং প্রকৃত distribution-এর নির্দেশনা; পোস্ট সংরক্ষণের স্পষ্ট বার্তা |
| Publish button | শুধু render হওয়া busy state দিয়ে submit আটকাত | একই event loop-এ দ্রুত double click-ও একবার submit করে |
| NGO claim | volunteer assign করার ভুল নির্দেশ; sticky action নিষ্ক্রিয় হয়ে যেত | volunteer নিজে mission গ্রহণ করেন—এ কথা স্পষ্ট; Continue to claim দিয়ে পরের ধাপে যাওয়া যায় |
| Claimed food refresh | নিজের claim-এর পরের link হারিয়ে যেতে পারত | authenticated NGO-এর saved claim থেকে link ফেরত আসে |
| Volunteer assignment | save-এর response হারালে আবার acceptance-এর error আসত | নিজের matching assigned mission খুঁজে সেখানেই এগোয়; stale/error feed থেকে নতুন acceptance বন্ধ থাকে |
| Receipt প্রথম load | failure হলে retry button ছিল না | load ও save error আলাদা; retry করে তথ্য আনা যায় |
| Receipt form | quantity/condition error শুধু ওপরের message-এ থাকত | ভুল field চিহ্নিত হয় ও focus পায়; mismatch ও damaged-food notes-এর প্রয়োজন বোঝানো হয় |
| Receipt save | দ্রুত double click বা response হারালে বিভ্রান্তি | একবার submit; server-এ saved receipt থাকলে সেটিই দেখায়; failure হলে লেখা তথ্য থাকে |
| Damaged receipt | শুধু distribution blocked লেখা | বিতরণ বন্ধ থাকে এবং food safety issue report-এর সরাসরি link থাকে |
| Mobile receipt/distribution | পরিচিতিমূলক বড় card-এ form অনেক নিচে থাকত | একই তথ্য ছোট সারিতে; বাংলা quantity ও unit দেখানো হয় |

## Browser-এ পরীক্ষা

`npm run test:journey:browser` আলাদা random PostgreSQL schema-তে এই যাত্রা চালায়:

1. Donor form validation → draft save/reload → পাঁচ ধাপ → simulated save failure
   → তথ্য অক্ষত রেখে পুনরায় প্রকাশ → tracking।
2. NGO discovery → খাবারের বিবরণ → confirmation বাতিল/পুনরায় নিশ্চিত → নিজের
   claim reload-এর পরও Continue to claim।
3. Volunteer duty OFF-এ acceptance বন্ধ → duty ON → acceptance; assignment
   server-এ সংরক্ষণ করে response হারানোর simulation → একই mission খোলে।
4. Pickup trip → arrival → ভুল/সঠিক OTP → delivery trip → NGO delivery OTP →
   receipt → প্রকৃত মানুষ/meal সংখ্যা দিয়ে distribution। Donor/NGO/Volunteer
   তিন account-এই সংরক্ষিত ফলাফল মেলে।
5. নতুন code-এ পুরোনো code লুকানো, দ্রুত double click, stale tracking recovery,
   incident hold ও reduced-motion আগের coordination check-এ থাকে।
6. আলাদা receipt case-এ load retry, invalid quantity, mismatch acknowledgement,
   damaged-food notes, save failure, lost-response recovery, reload এবং distribution
   blocked/allowed next step দেখা হয়।

Wizard, published, NGO detail/claim ও dispatch screen বাংলা/ইংরেজিতে 320, 390,
1440px-এ পরীক্ষা হয়। Coordination-এ 768px-ও আছে। Receipt recovery-তে বাংলা 320px,
ইংরেজি 390px এবং desktop 1440px ব্যবহার হয়। Screenshots gitignored
`.local-postgres/journey-browser/`, `coordination-browser/`, `receipt-recovery/`-তে থাকে।

```sh
npm run db:setup
npm run build
npm run test:journey:browser
npm run test:discovery:browser
npm run lint
npm run typecheck
node --import tsx --test tests/*.test.ts
npm run test:auth
```

Linux-এ installed Chromium ব্যবহার করতে command-এর আগে
`PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium` দিন। মূল app-এর account বা rescue
record এই পরীক্ষায় পরিবর্তন হয় না। কোনো নতুন database migration প্রয়োজন নেই।

## যাচাইকৃত ফল

Full journey-তে ৫৪টি শুরুর screen এবং ২৪টি coordination layout check, তিনটি
receipt recovery case ও বিদ্যমান discovery suite-এর ১৬টি layout check সফল।
সব মিলিয়ে ৯৭টি screen/language check; কোনো browser runtime error পাওয়া যায়নি।
এ ছাড়া ১০৭টি API test, ৪১টি unit test, production build, lint ও typecheck সফল।

## এই যাচাইয়ের সীমা

এটি UI ও database workflow-এর পরীক্ষা। বাস্তব খাদ্য পরীক্ষা, SMS delivery,
live volunteer GPS বা road ETA বাস্তবায়িত হয়েছে বলে ধরা হয়নি। Browser test-এর
network failure নির্দিষ্ট ধাপে অনুকরণ করা হয়েছে; সব সম্ভাব্য network failure বা
প্রত্যেক ধরনের device/browser পরীক্ষা করার দাবি করা হচ্ছে না।
