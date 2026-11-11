# 🍱 ShareBite BD — Smart Surplus Food Rescue Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet & OSM](https://img.shields.io/badge/GIS-OpenStreetMap%20%2B%20Leaflet-199900?style=flat-square&logo=openstreetmap)](https://leafletjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM%206-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![UN SDG 2](https://img.shields.io/badge/UN%20SDG-2:%20Zero%20Hunger-E5243B?style=flat-square)](https://sdgs.un.org/goals/goal2)
[![UN SDG 12](https://img.shields.io/badge/UN%20SDG-12:%20Responsible%20Consumption-BF8B2E?style=flat-square)](https://sdgs.un.org/goals/goal12)
[![BFSA Compliant](https://img.shields.io/badge/Food%20Safety-BFSA%204hr%20Rule-059669?style=flat-square)](https://bfsa.gov.bd/)

> **"অতিরিক্ত খাবার নষ্ট নয়, সম্মানের সাথে মানুষের পাতে।"**  
> An enterprise-grade, hyper-local civic-tech food rescue platform connecting university cafeterias, restaurants, and catering banquets with nearby charities and volunteer student riders within a 15-minute cycling corridor in Dhaka.

---

## 📌 The Problem We Solve

1. **Massive Food Waste:** Over 10.7 million tons of food is wasted annually in Bangladesh (UNEP Food Waste Index). Hundreds of kilograms of fresh meals from university cafeterias, convention centers, and restaurants are dumped daily.
2. **Urban Hunger & Malnutrition:** Just 2 km away from affluent cafeterias, street children, orphanages, and shelter communities face acute food insecurity.
3. **The 4-Hour Thermal Danger Zone:** Under ambient Dhaka temperatures, cooked food spoils rapidly. Traditional phone calls and ad-hoc coordination are too slow, leading to spoilage before food can be safely consumed.

---

## ⚡ Core Capabilities & Portals

* **🏢 Food Donor Portal (`/donor`):** 60-Second listing interface for cafeteria managers with meal categories, portion estimation, and pickup coordinates.
* **🌡️ AI Spoilage Countdown Meter:** Dynamic biological countdown tracking ambient temperature and safe thermal windows (BFSA 4-hour auto-lock prevents expired food listings).
* **🤝 NGO / Charity Cockpit (`/ngo`):** Discover nearby edible meals on interactive feeds, claim food batches, and verify delivery receipts.
* **🛵 Volunteer Rider Cockpit (`/volunteer`):** Live dispatch radar for student cyclists with double-handshake verification (4-digit pickup OTP and drop-off confirmation).
* **🗄️ Real Database & REST APIs (`/api/auth/*`):** Full database persistence for new Donors, NGOs, and Volunteers with strict Role-Based Access Control (RBAC) preventing unauthorized cross-portal access.
* **🗺️ Hyper-Local Radar Map (`/explore`):** 100% free OpenStreetMap & Leaflet with zero Google Maps API costs. Visualizes real-time surplus hotspots and 15-minute cycling corridors in Dhaka.
* **🏢 UIU Campus Pilot Ready:** Pre-configured telemetry centered on United International University (UIU), Madani Avenue, and surrounding shelter homes.

---

## 🛠️ Technology Stack

| Layer | Technology | Why We Chose It |
|---|---|---|
| **Frontend Framework** | **Next.js 16 (App Router)** | Hybrid SSR/SSG, zero client bundle overhead, PWA-ready for mobile donors |
| **UI Library** | **React 19** | Modern Actions, concurrent transitions, high-performance DOM updates |
| **Language** | **TypeScript 5.8** | Full strict type safety across all domain models, props, and API contracts |
| **Styling** | **Tailwind CSS v4** | Modern utility-first CSS, responsive dark/light components, smooth transitions |
| **Geospatial & Mapping** | **Leaflet + OpenStreetMap** | 100% open-source, zero per-request licensing costs, privacy-friendly |
| **Database & ORM** | **Prisma 6 + PostgreSQL** | Relational integrity, atomic transactions (preventing claim race conditions) |
| **Icons & Design** | **Lucide React** | Feather-weight, accessible, consistent iconography |

---

## 🚀 Quick Start & Installation

### Prerequisites
* **Node.js:** `v18.18.0` or `v20.x+` (LTS recommended) — [Download Node.js](https://nodejs.org/)
* **Git:** (Optional if downloaded via ZIP)

---

### Option 1: 1-Click Launch on Windows (Recommended) ⚡
Simply double-click the **`run-project.bat`** file in the project root directory.
* Automatically verifies Node.js installation.
* Automatically installs missing packages safely on the first run.
* **Smart Auto-Launch:** Monitors the server and opens your default browser at `http://localhost:3000` the exact moment Next.js is 100% ready.

---

### Option 2: Standard Terminal Method (Any OS)

```bash
# 1. Clone the repository
git clone https://github.com/mahamudul-hasan7/shearbitebd.git
cd shearbitebd

# 2. Install dependencies (safe cross-platform install)
npm install

# 3. Setup environment variables (optional for local mock mode)
cp .env.example .env

# 4. Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Mobile Access & PWA Guide (মোবাইল থেকে ব্যবহারের নিয়ম)

ShareBite BD সম্পূর্ণ মোবাইল-ফার্স্ট ও পিডব্লিউএ (PWA) কমপ্লায়েন্ট। যেকোনো স্মার্টফোন থেকে এটি একটি নেটিভ মোবাইল অ্যাপের মতো ব্যবহার করা যায়:

### পদ্ধতি ১: আসল মোবাইল ফোনে সরাসরি ওপেন করা (একই Wi-Fi নেটওয়ার্কে)
1. আপনার মোবাইল এবং কম্পিউটারকে **একই Wi-Fi** রাউটারে সংযুক্ত রাখুন (অথবা আপনার ফোনের মোবাইল হটস্পটে কম্পিউটারটি কানেক্ট করুন)।
2. কম্পিউটারের টার্মিনালে `ipconfig` দিয়ে IPv4 Address দেখে নিন (যেমন: `192.168.0.103`)।
3. আপনার ফোনের ব্রাউজার (Chrome / Safari) ওপেন করে অ্যাড্রেস বারে টাইপ করুন:
   ```text
   http://192.168.0.103:3000
   ```
   *(এখানে `192.168.0.103` এর জায়গায় আপনার কম্পিউটারের আইপি দিন)*

### পদ্ধতি ২: হোম স্ক্রিনে ইন্সটল করে আসল অ্যাপের মতো চালানো (PWA Standalone App)
- **Android (Google Chrome):** ব্রাউজারের উপরে ডানদিকের তিনটি ডটে (⋮) ট্যাপ করে **"Add to Home screen"** অথবা **"Install app"** সিলেক্ট করুন।
- **iPhone / iOS (Safari):** নিচে শেয়ার আইকনে (⎋) ট্যাপ করে স্ক্রোল করে **"Add to Home Screen"** সিলেক্ট করুন।
- **সুবিধা:** ফোনের হোম স্ক্রিনে ShareBite BD-র অ্যাপ আইকন চলে আসবে। ব্রাউজারের কোনো অ্যাড্রেস বার ছাড়াই একদম নেটিভ অ্যাপের মতো ফুলস্ক্রিনে ৫-ট্যাব বটম ডক, ভাইব্রেশন ও ওটিপি নামপ্যাড সহ চলবে।

### পদ্ধতি ৩: কম্পিউটারের ব্রাউজারে মোবাইল ভিউ (DevTools Simulation)
1. কম্পিউটারের ব্রাউজারে `http://localhost:3000` পেজে যান।
2. কীবোর্ডে **`F12`** (অথবা `Ctrl + Shift + I`) চাপুন।
3. এরপর **`Ctrl + Shift + M`** চাপুন (বা উপরে বামের মোবাইল/ট্যাবলেট আইকনে ক্লিক করুন)।
4. ড্রপডাউন থেকে **iPhone 14 Pro**, **Pixel 7** বা **Samsung Galaxy** সিলেক্ট করে টেস্ট করুন।

---

## 📂 Project Structure

```text
sharebite-bd-frontend/
├── prisma/
│   ├── schema.prisma            # PostgreSQL schema (Users, Donations, Claims, Logs)
│   └── seed.ts                  # Dhaka demo data seeder
├── public/                      # Static assets, brand SVGs, and Leaflet marker icons
├── src/
│   ├── app/                     # Next.js 16 App Router (45+ static & dynamic routes)
│   │   ├── (auth)/              # Authentication & onboarding portals
│   │   ├── donor/               # Food donor management & 60s posting dashboard
│   │   ├── ngo/                 # Charity discovery & claim management cockpit
│   │   ├── volunteer/           # Rider rescue cockpit, OTP verification & radar
│   │   ├── explore/             # Interactive live Leaflet map radar
│   │   └── layout.tsx           # Global shell & responsive navigation
│   ├── components/              # Modular UI components (Map, Radar, Countdown, Modals)
│   ├── lib/                     # Domain utilities, mock stores, and Prisma client singleton
│   └── types/                   # TypeScript interfaces and domain schemas
├── scripts/                     # Smart launcher & presentation generators
│   └── start-and-open.mjs       # Zero-lag auto-browser launch engine
├── run-project.bat              # Portable 1-click launcher for Windows
└── package.json                 # Project scripts and dependencies
```

---

## 👥 University SE Lab Project Team

**Department of Computer Science & Engineering (CSE)**  
**United International University (UIU)**  
*Course: Software Engineering Lab*

| Name | Student ID | Project Role |
|---|---|---|
| **Md Mahamudul Hasan** | **0112330182** | Team Lead & Frontend Architect |
| **Jabid Hasan** | **0112410383** | Problem Research & UI/UX Specialist |
| **Md. Asifur Rahman Shihab** | **0112330664** | Core Feature & Spoilage Logic Engineer |
| **Md Tarik Hasan Emon** | **0112330388** | Technical Architecture & Database Engineer |
| **SM Abdullah** | **0112330729** | QA, Agile Timeline & Deployment Engineer |

---

## 📄 License & Ethical Compliance

Developed for educational and humanitarian purposes under the **MIT License**. Complies with Bangladesh Food Safety Authority (BFSA) temperature control standards and UN Sustainable Development Goals (SDG 2: Zero Hunger & SDG 12: Responsible Consumption).
