# তিন role-এর shared UI system

Donor, NGO ও Rider-এর একই ধরনের screen একই design foundation ব্যবহার করে।
Role অনুযায়ী তথ্য, permission ও কাজের অগ্রাধিকার আলাদা; navigation, typography,
card, button, form focus, filter, feedback ও motion-এর নিয়ম shared।

## Role identity

| Role | Accent | Hover/strong | Soft background |
| --- | --- | --- | --- |
| Donor | `#047857` | `#065f46` | `#ecfdf5` |
| NGO | `#1d4ed8` | `#1e40af` | `#eff6ff` |
| Rider | `#c2410c` | `#9a3412` | `#fff7ed` |

Palette `src/app/globals.css`-এ আছে। `PortalTheme` প্রতিটি role layout ও
`PortalShell`-এ scoped `--role-*` variables দেয়; এর ফলে incoming offer-ও সঠিক
role identity পায়। Body-তে portaled mobile drawer নিজের theme পায়। Public site
ও admin-এর brand/semantic palette এই role variables দিয়ে বদলানো হয় না।

Header-এ সবসময় icon ও লেখা-সহ Donor/NGO/Rider badge থাকে। Mobile-এ নামের সঙ্গে
একটি ছোট identity row, desktop-এ header ও sidebar-এ পরিচয় থাকে। শুধুমাত্র colour
দেখে role চিনতে হয় না। White text-এর বিপরীতে তিন accent-এর contrast 4.5:1-এর বেশি।

## Shared pattern

- **Page frame:** sidebar/header/page gutters এক; ছোট screen-এ drawer ও bottom
  navigation। নতুন/edit form, tracking, receipt, distribution ও mission route-এ
  focused workspace বজায় রাখতে bottom navigation লুকানো হয়।
- **Actions:** `Button`/`ButtonLink`-এর primary action role accent ব্যবহার করে।
  Outline/ghost, focus ring, 44px mobile targets ও reduced-motion একই নিয়মে চলে।
- **Content:** neutral `Card`, shared card headings, metric/work cards ও activity
  disclosure ব্যবহার হয়। Status badge-এর নিজস্ব semantic colour থাকে।
- **Collections:** Donor donations, NGO claims ও Rider history একই
  `CollectionToolbar` ব্যবহার করে। Search/filter-এর নাম, touch height ও selected
  state এক নিয়মে থাকে; filter-এর অর্থ ও query logic role অনুযায়ী থাকে।
- **Forms:** existing shared input/select/textarea/checkbox থাকে। Focus role accent,
  invalid field-এর error styling অপরিবর্তিত থাকে।
- **Details, profiles, addresses, settings, notifications ও support:** একই
  `PortalShell`, card ও action system থেকে identity ও shared styling পায়।
- **Dashboard:** Donor/NGO-এর shared metric ও work-card pattern Rider overview-তেও
  ব্যবহৃত হয়। Rider-এর next mission action ও সংরক্ষিত verified delivery হিসাব সামনে
  থাকে। অনির্ধারিত rating/ETA-এর decorative hero metrics সরিয়ে actual records
  দেখানো হয়। বিদ্যমান mission/OTP/SOS controls ও optional information বহাল থাকে।

## Semantic colour ও motion

Success সব role-এ success, warning সব role-এ warning, danger সব role-এ danger।
Role accent-এর জন্য `--brand-*` বা semantic tokens override করা হয় না। Map-এর
pickup/destination marker-এর অর্থও অপরিবর্তিত। Header identity static থাকে;
স্বাভাবিক hover/selection transition ছোট ও পরিমিত। Reduced-motion preference-এ
shared action animation বন্ধ থাকে।

## যাচাই

```sh
npm run db:local:start
npm run build
npm run test:role-ui:browser
npm run test:portals:browser
npm run test:journey:browser
npm run lint
npm run typecheck
node --import tsx --test tests/*.test.ts
npm run test:auth
```

`test:role-ui:browser` তিন role-এর dashboard, collection, form, profile/ID,
address, notification, settings/support ও detail/mission screen বাংলা ও ইংরেজিতে
320/390/1440px-এ পরীক্ষা করে; dashboard 768px-এও দেখা হয়। Header identity,
primary action colour, contrast, semantic palette, drawer focus, language switching
ও reduced-motion যাচাই হয়। Test data আলাদা random PostgreSQL schema-তে থাকে।
Screenshots ও ফলাফল gitignored `.local-postgres/role-ui/`-এ থাকে। Linux-এ প্রয়োজন
হলে `PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium` দিন।

এই পরিবর্তনে ২৮টি route-এর ১৭৪টি বাংলা/ইংরেজি responsive layout check পাশ করেছে।
একই saved distribution-এর meal total তিন role-এ মেলে; role badge, action contrast,
horizontal overflow, mobile drawer focus ও reduced-motion-ও পরীক্ষা করা হয়েছে।

Demo-তে তিনটি আলাদা browser profile বা browser ব্যবহার করুন; একই browser profile-এর
সাধারণ tab-গুলো login cookie ভাগ করে। নতুন UI session বা permission-এর নিয়ম বদলায় না।
