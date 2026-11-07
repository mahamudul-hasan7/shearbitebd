import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const workspaceRoot = process.cwd();
const htmlPath = path.join(workspaceRoot, "proposal_presentation.html");
const pdfPath = path.join(workspaceRoot, "ShareBite_BD_Project_Proposal.pdf");

console.log("Generating ShareBite BD Comprehensive Project Proposal...");

const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>ShareBite BD — Project Proposal</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', 'Hind Siliguri', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0f172a;
      color: #1e293b;
      line-height: 1.45;
      font-size: 11.5px;
    }

    .page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      position: relative;
      background: #ffffff;
      padding: 14mm 16mm 14mm 16mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Top Running Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 7px;
      border-bottom: 1.5px solid #e2e8f0;
      font-size: 9.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .page-header .brand {
      color: #059669;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Running Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 7px;
      border-top: 1.5px solid #e2e8f0;
      font-size: 9.5px;
      color: #94a3b8;
      font-weight: 600;
    }

    .page-content {
      flex: 1;
      padding-top: 10px;
      padding-bottom: 8px;
      display: flex;
      flex-direction: column;
    }

    /* Headings & Texts */
    h1, h2, h3, h4 {
      color: #0f172a;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .section-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #059669;
      background: #ecfdf5;
      padding: 3px 9px;
      border-radius: 9999px;
      border: 1px solid #a7f3d0;
      margin-bottom: 6px;
      width: fit-content;
    }

    .section-title {
      font-size: 19px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-subtitle {
      font-size: 11px;
      color: #475569;
      font-weight: 500;
      margin-bottom: 11px;
      line-height: 1.4;
    }

    /* Cards & Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 11px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 9px;
    }

    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .card-accent {
      border-left: 4px solid #059669;
      background: #f8fafc;
    }

    .card-rose {
      border-left: 4px solid #e11d48;
      background: #fff1f2;
    }

    .card-amber {
      border-left: 4px solid #d97706;
      background: #fffbeb;
    }

    .card-blue {
      border-left: 4px solid #2563eb;
      background: #eff6ff;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin: 6px 0;
    }

    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 800;
      text-align: left;
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
    }

    td {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Callouts */
    .callout {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 10px;
      padding: 10px 13px;
      margin: 8px 0;
    }

    .callout-title {
      font-weight: 800;
      color: #166534;
      font-size: 11.5px;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-amber { background: #fef3c7; color: #b45309; }
    .badge-rose { background: #ffe4e6; color: #be123c; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }

    /* Cover Page Specific Styles */
    .cover-page {
      background: linear-gradient(145deg, #064e3b 0%, #065f46 40%, #022c22 100%);
      color: #ffffff;
      padding: 18mm 18mm;
      justify-content: space-between;
    }

    .cover-page .page-header, .cover-page .page-footer {
      border: none;
      color: #6ee7b7;
    }

    .cover-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(8px);
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 10.5px;
      font-weight: 700;
      color: #a7f3d0;
      margin-bottom: 18px;
    }

    .cover-title {
      font-size: 38px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin-bottom: 10px;
    }

    .cover-title span {
      color: #34d399;
    }

    .cover-subtitle {
      font-size: 16px;
      font-weight: 700;
      color: #cbd5e1;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .cover-tagline-bn {
      font-size: 14.5px;
      font-weight: 600;
      color: #6ee7b7;
      margin-bottom: 22px;
      padding-left: 12px;
      border-left: 3px solid #10b981;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      background: rgba(2, 44, 34, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      padding: 14px 16px;
      margin-top: 15px;
    }

    .cover-meta-item h5 {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #94a3b8;
      margin-bottom: 3px;
    }

    .cover-meta-item p {
      font-size: 11.5px;
      font-weight: 700;
      color: #f1f5f9;
    }

    .team-table-cover {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .team-table-cover th {
      background: rgba(0, 0, 0, 0.25);
      color: #a7f3d0;
      font-size: 10px;
      padding: 7px 10px;
      border: none;
    }

    .team-table-cover td {
      color: #ffffff;
      padding: 7px 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-left: none;
      border-right: none;
      border-bottom: none;
      font-size: 10px;
    }

    /* Diagram Elements */
    .flowchart-step {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 10px;
    }

    .flowchart-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #059669;
      color: #ffffff;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 11px;
      flex-shrink: 0;
    }

    .flowchart-arrow {
      text-align: center;
      font-size: 14px;
      color: #94a3b8;
      font-weight: 900;
    }

    ul, ol {
      padding-left: 17px;
    }

    li {
      margin-bottom: 4px;
      color: #334155;
    }

    strong {
      color: #0f172a;
    }

    .pill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 5px;
    }

    .pill {
      font-size: 9px;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      padding: 2px 8px;
      border-radius: 9999px;
      border: 1px solid #e2e8f0;
    }

    .kpi-box {
      text-align: center;
      padding: 11px 8px;
      border-radius: 10px;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
    }

    .kpi-val {
      font-size: 20px;
      font-weight: 900;
      color: #059669;
      line-height: 1.1;
      margin-bottom: 2px;
    }

    .kpi-lbl {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748b;
      line-height: 1.25;
    }

    .kpi-sub {
      font-size: 8.5px;
      color: #94a3b8;
      margin-top: 2px;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: COVER PAGE ================= -->
  <div class="page cover-page">
    <div class="page-header">
      <div class="brand">
        <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="16" fill="#34d399"/>
          <path d="M22 36C20 33 19 30 19 26C19 20 23.5 16 28 16C30.5 16 32.5 17.5 33.5 19.5C34.5 17.5 36.5 16 39 16C43.5 16 48 20 48 26C48 30 46 34 42 38L33.5 46.5L25 38" stroke="#064e3b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="46" cy="18" r="8" fill="#f59e0b"/>
        </svg>
        <span>SHAREBITE BD &bull; ENGINEERING PROPOSAL</span>
      </div>
      <div>ACADEMIC YEAR 2026-2027</div>
    </div>

    <div style="margin-top: 15px; margin-bottom: 15px;">
      <div class="cover-badge">
        <span>🚀 CSE CAPSTONE / FINAL YEAR PROJECT PROPOSAL</span>
      </div>

      <h1 class="cover-title">ShareBite <span>BD</span></h1>
      <h2 class="cover-subtitle">Smart Surplus Food Rescue & Safety-Compliant Redistribution Network</h2>
      <p class="cover-tagline-bn">স্মার্ট উদ্বৃত্ত খাদ্য সুরক্ষা নেটওয়ার্ক &mdash; অতিরিক্ত খাবার নষ্ট নয়, প্রযুক্তির সাহায্যে সম্মানের সাথে মানুষের পাতে।</p>

      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <span class="badge" style="background: rgba(16, 185, 129, 0.25); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5);">🎯 UN SDG 2: Zero Hunger</span>
        <span class="badge" style="background: rgba(245, 158, 11, 0.25); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.5);">🌱 UN SDG 12: Responsible Consumption</span>
        <span class="badge" style="background: rgba(59, 130, 246, 0.25); color: #bfdbfe; border: 1px solid rgba(59, 130, 246, 0.5);">🛡️ BFSA Safety Guidelines Compliant</span>
      </div>

      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <h5>ডিপার্টমেন্ট ও প্রোগ্রাম</h5>
          <p>Department of Computer Science & Engineering (CSE)</p>
        </div>
        <div class="cover-meta-item">
          <h5>টার্গেট পাইলট জোন</h5>
          <p>Dhaka Metro (UIU Campus, Badda, Banani, Gulshan)</p>
        </div>
        <div class="cover-meta-item">
          <h5>সফটওয়্যার আর্কিটেকচার</h5>
          <p>Full-Stack Hyper-Local 3-Sided Micro-Logistics Network</p>
        </div>
        <div class="cover-meta-item">
          <h5>প্রজেক্টের আনুমানিক সময়কাল</h5>
          <p>16 Weeks (4 Agile Sprints & Live Campus Deployment)</p>
        </div>
      </div>

      <div style="margin-top: 18px;">
        <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #a7f3d0; margin-bottom: 6px;">👥 প্রস্তাবক প্রজেক্ট টিম মেম্বার্স (Project Team Roster):</h4>
        <table class="team-table-cover">
          <thead>
            <tr>
              <th>ক্রম</th>
              <th>শিক্ষার্থীর নাম</th>
              <th>স্টুডেন্ট আইডি (ID)</th>
              <th>প্রস্তাবিত দায়িত্ব / টেকনিক্যাল রোল</th>
              <th>স্বাক্ষর</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>০১</td>
              <td><strong>Team Lead & Frontend Architect</strong></td>
              <td>011 2X1 XXX</td>
              <td>Next.js 16 UI, Component System, UX Portals</td>
              <td>____________</td>
            </tr>
            <tr>
              <td>০২</td>
              <td><strong>Backend & Database Engineer</strong></td>
              <td>011 2X1 XXX</td>
              <td>Prisma ORM, PostgreSQL Schema, State Engine</td>
              <td>____________</td>
            </tr>
            <tr>
              <td>০৩</td>
              <td><strong>Geo-Logistics & Realtime Systems</strong></td>
              <td>011 2X1 XXX</td>
              <td>Leaflet GIS Routing, Rescue Clock, QR/OTP</td>
              <td>____________</td>
            </tr>
            <tr>
              <td>০৪</td>
              <td><strong>QA, Security & Documentation Lead</strong></td>
              <td>011 2X1 XXX</td>
              <td>Audit Trail, Safety Standards, Pilot Operations</td>
              <td>____________</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="page-footer">
      <div>Dhaka, Bangladesh &bull; Confidential Academic Document</div>
      <div>Project Proposal &bull; Page 1 of 8</div>
    </div>
  </div>

  <!-- ================= PAGE 2: EXECUTIVE SUMMARY & PROBLEM ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">ShareBite BD &bull; Section 01</div>
      <div>Executive Summary & Problem Statement</div>
    </div>

    <div class="page-content">
      <div class="section-eyebrow">Executive Summary & The Food Waste Crisis</div>
      <h2 class="section-title">১. প্রকল্প সারসংক্ষেপ ও বাস্তব সমস্যা (The Problem)</h2>
      <p class="section-subtitle">কেন এই প্রজেক্টটি আমাদের ফাইনাল ইয়ার / ক্যাপস্টন হিসেবে সর্বোচ্চ নম্বর পাওয়ার দাবিদার?</p>

      <!-- 4 Key Numbers Grid -->
      <div class="grid-4" style="margin-bottom: 12px;">
        <div class="kpi-box" style="border-top: 3px solid #e11d48;">
          <div class="kpi-val" style="color: #e11d48;">১০.৭M</div>
          <div class="kpi-lbl">টন বাৎসরিক খাদ্য অপচয়</div>
          <div class="kpi-sub">জাতিসংঘের UNEP রিপোর্ট অনুযায়ী বাংলাদেশে</div>
        </div>
        <div class="kpi-box" style="border-top: 3px solid #d97706;">
          <div class="kpi-val" style="color: #d97706;">৪ ঘণ্টা</div>
          <div class="kpi-lbl">বায়োলজিক্যাল লাইফস্প্যান</div>
          <div class="kpi-sub">সাধারণ তাপমাত্রায় ব্যাক্টেরিয়ার বিস্তার শুরু হয়</div>
        </div>
        <div class="kpi-box" style="border-top: 3px solid #2563eb;">
          <div class="kpi-val" style="color: #2563eb;">৩৮ লাখ</div>
          <div class="kpi-lbl">ভাসমান ও সুবিধাবঞ্চিত মানুষ</div>
          <div class="kpi-sub">ঢাকা মেট্রোর তীব্র পুষ্টিহীন জনগোষ্ঠীর আকার</div>
        </div>
        <div class="kpi-box" style="border-top: 3px solid #059669;">
          <div class="kpi-val" style="color: #059669;">০%</div>
          <div class="kpi-lbl">ডিজিটাল ট্রেসেবিলিটি</div>
          <div class="kpi-sub">সনাতন পদ্ধতিতে কোনো CSR অডিট ট্রেইল নেই</div>
        </div>
      </div>

      <div class="card card-accent" style="margin-bottom: 11px;">
        <h4 style="color: #065f46; margin-bottom: 4px; font-size: 11.5px;">💡 আমাদের মূল প্রতিপাদ্য (Executive Pitch):</h4>
        <p style="color: #334155; line-height: 1.45;">
          প্রতিদিন রাজধানী ঢাকার কনভেনশন সেন্টার, ক্যাফেটেরিয়া (যেমন UIU সেন্ট্রাল ক্যাফেটেরিয়া), এবং রেস্তোরাঁগুলোতে হাজার হাজার প্লেট টাটকা ও নিরাপদ খাবার অপচয় হয়ে ডাস্টবিনে নিক্ষিপ্ত হয়। অপরদিকে কয়েক কিলোমিটার দূরত্বেই বস্তিবাসী পথশিশু ও ছিন্নমূল মানুষ অনাহারে রাত কাটায়। খাবারও বিদ্যমান এবং ক্ষুধার্ত মানুষও বিদ্যমান &mdash; শুধু <strong>হাইপার-লোকাল প্রযুক্তিগত সমন্বয় ও লজিস্টিকস গতির অভাবের কারণে</strong> এই খাবার নষ্ট হয়। <strong>ShareBite BD</strong> একটি রিয়েল-টাইম ৩-পাক্ষিক প্ল্যাটফর্ম যা মাত্র ১৫-৩০ মিনিটের মধ্যে অতিরিক্ত উদ্বৃত্ত খাবার ভেরিফায়েড চ্যারিটি ও ক্ষুধার্ত মানুষের কাছে পৌঁছাতে সক্ষম।
        </p>
      </div>

      <h3 style="font-size: 12.5px; margin-bottom: 6px;">🚨 সনাতন চ্যারিটি কেন ব্যর্থ হচ্ছে? (Root Cause Breakdown)</h3>
      <div class="grid-2" style="margin-bottom: 11px;">
        <div class="card card-rose">
          <strong style="color: #be123c;">১. ম্যানুয়াল ফোন কল ও সমন্বয়ের অভাব</strong>
          <p style="font-size: 10.5px; color: #475569; margin-top: 2px;">
            ক্যাফেটেরিয়া বা ক্যাটারিং ম্যানেজার রাত ১০টায় কাকে কল করবেন তা জানেন না। চ্যারিটির নম্বর খুঁজতে খুঁজতেই ২ ঘণ্টা পার হয়ে যায়।
          </p>
        </div>
        <div class="card card-amber">
          <strong style="color: #b45309;">২. টাইম ডিকে ও স্পয়েলেজের ভয় (BFSA)</strong>
          <p style="font-size: 10.5px; color: #475569; margin-top: 2px;">
            খাদ্য নিরাপত্তা আইন অনুযায়ী রান্না করা খাবার নির্দিষ্ট তাপমাত্রায় নির্দিষ্ট সময়ে না খেলে ফুড পয়জনিং হয়। দায় এড়াতে অনেকে ফেলে দেয়।
          </p>
        </div>
        <div class="card card-blue">
          <strong style="color: #1d4ed8;">৩. লাস্ট-মাইল লজিস্টিকস ও রাইডার সংকট</strong>
          <p style="font-size: 10.5px; color: #475569; margin-top: 2px;">
            এনজিওর কাছে নিজস্ব পিকআপ ভ্যান সব সময় প্রস্তুত থাকে না। উবার-স্টাইলের ক্রাউডসোর্সড ভলান্টিয়ার নেটওয়ার্ক অনুপস্থিত।
          </p>
        </div>
        <div class="card card-accent">
          <strong style="color: #065f46;">৪. অস্বচ্ছতা ও সিএসআর (CSR) রেকর্ডের ঘাটতি</strong>
          <p style="font-size: 10.5px; color: #475569; margin-top: 2px;">
            খাবার আসলেই কি কোনো এতিমখানায় পৌঁছাল নাকি মাঝপথে নষ্ট হলো? প্রমাণ বা প্রাতিষ্ঠানিক স্বীকৃতির কোনো ডিজিটাল মেকানিজম নেই।
          </p>
        </div>
      </div>

      <h3 style="font-size: 12px; margin-bottom: 5px;">📊 তুলনামূলক বিশ্লেষণ: সনাতন পদ্ধতি বনাম ShareBite BD</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 28%;">প্যারামিটার</th>
            <th style="width: 36%;">সনাতন প্রচলিত পদ্ধতি (Manual)</th>
            <th style="width: 36%; color: #047857; background: #ecfdf5;">ShareBite BD ডিজিটাল ইঞ্জিন</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>পোস্টিং ও রিকোয়েস্ট সময়</strong></td>
            <td>৩০-৪৫ মিনিট (ম্যানুয়াল ফোন কল ও মেসেজিং)</td>
            <td><strong>৬০ সেকেন্ডের ডিজিটাল ফর্ম ও স্মার্ট কনভার্টার</strong></td>
          </tr>
          <tr>
            <td><strong>পিকআপ উইন্ডো ট্র্যাকিং</strong></td>
            <td>অজ্ঞাত (অনেক সময় খাবার বাসি হয়ে যায়)</td>
            <td><strong>লাইভ BFSA রেসকিউ ক্লক ও সেফটি কাউন্টডাউন</strong></td>
          </tr>
          <tr>
            <td><strong>হ্যান্ডওভার নিরাপত্তা</strong></td>
            <td>মুখোমুখি অনিশ্চিত ভেরিফিকেশন</td>
            <td><strong>৪-সংখ্যার ওটিপি ও কিউআর স্ক্যান ফ্রড প্রিভেনশন</strong></td>
          </tr>
          <tr>
            <td><strong>লজিস্টিকস ও পরিবহন</strong></td>
            <td>এনজিওর সীমিত গাড়ি/কর্মীর ওপর নির্ভরশীল</td>
            <td><strong>নিকটবর্তী ভলান্টিয়ার বাইকার/সাইক্লিস্ট রাউটিং</strong></td>
          </tr>
          <tr>
            <td><strong>ইমপ্যাক্ট ও সিএসআর রিপোর্ট</strong></td>
            <td>কোনো প্রাতিষ্ঠানিক ডিজিটাল হিসাব নেই</td>
            <td><strong>স্বয়ংক্রিয় CO₂ ও পানি সাশ্রয় সার্টিফিকেট জেনারেটর</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <div>ShareBite BD &bull; Smart Surplus Food Rescue Network</div>
      <div>Page 2 of 8</div>
    </div>
  </div>

  <!-- ================= PAGE 3: THE SOLUTION & 3-SIDED ECOSYSTEM ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">ShareBite BD &bull; Section 02</div>
      <div>Solution Architecture & 3-Sided Ecosystem</div>
    </div>

    <div class="page-content">
      <div class="section-eyebrow">System Architecture & Workflow</div>
      <h2 class="section-title">২. আমাদের সমাধান: ৩-পাক্ষিক হাইপার-লোকাল প্ল্যাটফর্ম</h2>
      <p class="section-subtitle">ডোনার, এনজিও এবং ভলান্টিয়ারের মধ্যে রিয়েল-টাইম ডিজিটাল কোলাবরেশন</p>

      <div class="grid-3" style="margin-bottom: 11px;">
        <div class="card" style="border-top: 3px solid #059669;">
          <div style="font-size: 16px; margin-bottom: 3px;">🍲</div>
          <strong style="color: #065f46; font-size: 11px;">১. ফুড ডোনার প্ল্যাটফর্ম</strong>
          <p style="font-size: 9.5px; color: #64748b; margin-top: 2px;">(UIU ক্যাফেটেরিয়া, রেস্তোরাঁ, ক্যাটারার্স)</p>
          <ul style="margin-top: 6px; font-size: 9.5px; padding-left: 14px;">
            <li>৬০ সেকেন্ডে অতিরিক্ত খাবারের ছবি ও লট এন্ট্রি।</li>
            <li>AI স্পয়েলেজ ও সেফটি মিটার দিয়ে সময় নির্ধারণ।</li>
            <li>স্মার্ট মিল কনভার্টারে অটোম্যাটিক মিল কাউন্ট।</li>
            <li>৪-সংখ্যার হ্যান্ডওভার ওটিপি পিন জেনারেশন।</li>
          </ul>
        </div>

        <div class="card" style="border-top: 3px solid #2563eb;">
          <div style="font-size: 16px; margin-bottom: 3px;">🏢</div>
          <strong style="color: #1d4ed8; font-size: 11px;">২. এনজিও ডিসকভারি হাব</strong>
          <p style="font-size: 9.5px; color: #64748b; margin-top: 2px;">(মাস্তুল, বিদ্যানন্দ, স্থানীয় চ্যারিটি শেল্টার)</p>
          <ul style="margin-top: 6px; font-size: 9.5px; padding-left: 14px;">
            <li>রাডার ম্যাপ ভিউয়ে লাইভ খাবারের ব্যাচ প্রদর্শন।</li>
            <li>৩-১৫ কিমি দূরত্ব ও ক্যাটাগরি ভিত্তিক ফিল্টারিং।</li>
            <li>জরুরি খাবার (<২ ঘণ্টা বাকি) এক ক্লিকে ক্লেইম।</li>
            <li>বিতরণ ও সুবিধাবঞ্চিত উপকারভোগী ট্র্যাকিং।</li>
          </ul>
        </div>

        <div class="card" style="border-top: 3px solid #d97706;">
          <div style="font-size: 16px; margin-bottom: 3px;">🚴</div>
          <strong style="color: #b45309; font-size: 11px;">৩. ভলান্টিয়ার কমান্ড হাব</strong>
          <p style="font-size: 9.5px; color: #64748b; margin-top: 2px;">(ক্যাম্পাসের ছাত্র-ছাত্রী ও স্থানীয় রাইডার্স)</p>
          <ul style="margin-top: 6px; font-size: 9.5px; padding-left: 14px;">
            <li>উবার-স্টাইলে নিকটবর্তী রেসকিউ মিশন নোটিফিকেশন।</li>
            <li>ইনসুলেটেড ক্যারিয়ার চেকলিস্ট ও হাইজিন নিশ্চিতকরণ।</li>
            <li>টার্ন-বাই-টার্ন রুট ডিসপ্লে ও লাইভ হ্যান্ডওভার।</li>
            <li>ভেরিফিকেশন কিউআর স্ক্যান করে সফল ডেলিভারি।</li>
          </ul>
        </div>
      </div>

      <h3 style="font-size: 12.5px; margin-bottom: 6px;">🔄 খাদ্য উদ্ধারের সম্পূর্ণ লাইফসাইকেল (End-to-End Workflow)</h3>
      <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 11px;">
        <div class="flowchart-step">
          <div class="flowchart-num">১</div>
          <div>
            <strong>খাদ্য উদ্বৃত্ত ঘোষণা (Listing Creation):</strong> ক্যাফেটেরিয়া বা ওয়েডিং ম্যানেজার খাবারের ধরন (যেমন: কাচ্চি বিরিয়ানি), রান্নার সময় এবং ওজন লিখবেন। AI সেফটি মিটার স্বয়ংক্রিয়ভাবে দেখাবে এটি ৬৫°সে তাপে আর কত ঘণ্টা নিরাপদ।
          </div>
        </div>
        <div class="flowchart-step">
          <div class="flowchart-num">২</div>
          <div>
            <strong>স্বয়ংক্রিয় ম্যাচিং ও এনজিও ক্লেইম (Matching & Claim):</strong> নিকটবর্তী ভেরিফায়েড এনজিও (যেমন বাড্ডার মাস্তুল ফাউন্ডেশন) রাডার ম্যাপে অ্যালার্ট পাবে এবং তাদের সুবিধা অনুযায়ী লটটি ক্লেইম করে 'রিজার্ভ' করবে।
          </div>
        </div>
        <div class="flowchart-step">
          <div class="flowchart-num">৩</div>
          <div>
            <strong>ভলান্টিয়ার অ্যাসাইনমেন্ট (Volunteer Dispatch):</strong> ক্লেইম হওয়ার সাথে সাথে লোকাল এরিয়ার নিবন্ধিত স্টুডেন্ট রাইডারের কাছে নোটিফিকেশন যাবে। রাইডার মিশন গ্রহণ করে ক্যাফেটেরিয়ার দিকে রওনা হবে।
          </div>
        </div>
        <div class="flowchart-step">
          <div class="flowchart-num">৪</div>
          <div>
            <strong>নিরাপদ হ্যান্ডওভার ও ওটিপি ভেরিফিকেশন (Secure Handover):</strong> ডোনার রাইডারের অ্যাপে থাকা ৪ সংখ্যার ওটিপি কোড (যেমন: ৭৪২৯) মিলিয়ে সিল্ড গরম খাবারের ট্রে হস্তান্তর করবে।
          </div>
        </div>
        <div class="flowchart-step">
          <div class="flowchart-num">৫</div>
          <div>
            <strong>শেল্টারে বিতরণ ও ডিজিটাল রসিদ (Delivery & CSR):</strong> খাবার এতিমখানায় পৌঁছে এনজিও প্রতিনিধি কিউআর স্ক্যান করবে। তাৎক্ষণিকভাবে দাতার প্রোফাইলে সিএসআর ইমপ্যাক্ট সার্টিফিকেট যুক্ত হবে।
          </div>
        </div>
      </div>

      <div class="callout">
        <div class="callout-title">
          <span>🛡️ টু-স্টেপ ডিজিটাল সিকিউরিটি ও ফ্রড প্রিভেনশন মেকানিজম</span>
        </div>
        <p style="font-size: 10px; color: #166534; line-height: 1.4;">
          কর্পোরেট দাতা ও বড় রেস্তোরাঁগুলোর সবচেয়ে বড় ভয় থাকে খাবার ভুল ব্যক্তির হাতে যাওয়ার বা অপব্যবহারের। ShareBite BD-এর ডিজিটাল ওটিপি পিন এবং কিউআর হ্যান্ডওভার প্রটোকল নিশ্চিত করে যে প্রতিটি খাবারের প্যাকেট শতভাগ ট্র্যাকেবল এবং অথরাইজড ভলান্টিয়ার ও এনজিওর হাতেই পৌঁছাচ্ছে।
        </p>
      </div>
    </div>

    <div class="page-footer">
      <div>ShareBite BD &bull; Smart Surplus Food Rescue Network</div>
      <div>Page 3 of 8</div>
    </div>
  </div>

  <!-- ================= PAGE 4: TECHNICAL INNOVATIONS & MODULES ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">ShareBite BD &bull; Section 03</div>
      <div>Technical Innovations & Core Modules</div>
    </div>

    <div class="page-content">
      <div class="section-eyebrow">Product Features & Innovation</div>
      <h2 class="section-title">৩. প্রধান প্রযুক্তিগত উদ্ভাবন ও ফিচারসমূহ</h2>
      <p class="section-subtitle">যেসব বিশেষ ফিচারের কারণে আমাদের প্রজেক্টটি অন্যান্য গতানুগতিক সিস্টেম থেকে অনন্য</p>

      <div class="grid-2" style="margin-bottom: 11px;">
        <div class="card card-accent">
          <h4 style="color: #065f46; margin-bottom: 4px; font-size: 11.5px;">⚡ ১. AI Spoilage & Safety Meter (খাদ্য নিরাপত্তা গেজ)</h4>
          <p style="font-size: 10.5px; color: #334155; line-height: 1.4;">
            ডোনার যখনই রান্নার সময় ও খাদ্যের ধরন সিলেক্ট করবে, সিস্টেমে লাইভ একটি <strong>অ্যানিমেটেড স্পিডোমিটার ডায়াল</strong> ঘুরবে। এটি BFSA ফুড সেফটি গাইডলাইন মেনে দেখাবে:
          </p>
          <ul style="margin-top: 5px; font-size: 10px; padding-left: 14px;">
            <li>🟢 <strong>খাদ্যের তাপমাত্রা:</strong> >৬৫°সে (গরম অবস্থায় নিরাপদ) বা <৪°সে (হিমায়িত)</li>
            <li>⏱️ <strong>সেফ পিকআপ উইন্ডো:</strong> আর মাত্র ৩ ঘণ্টা ১৫ মিনিট বাকি</li>
            <li>⚠️ তাপমাত্রা ৬০°সে-এর নিচে নামলে ঝুঁকিপূর্ণ সতর্কতা নোটিফিকেশন।</li>
          </ul>
        </div>

        <div class="card card-blue">
          <h4 style="color: #1d4ed8; margin-bottom: 4px; font-size: 11.5px;">⚖️ ২. স্মার্ট মিল কনভার্টার (Smart Quantity Pills)</h4>
          <p style="font-size: 10.5px; color: #334155; line-height: 1.4;">
            সাধারণ মানুষ বা শেফরা সাধারণত কেজি বা ডেকচিতে হিসাব করেন। কিন্তু চ্যারিটির প্রয়োজন কয়জনের খাবার। আমাদের সিস্টেম রিয়েল-টাইম কনভার্ট করে:
          </p>
          <div style="background: #ffffff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 6px 8px; margin-top: 5px; font-size: 10.5px; font-weight: 700; color: #1e40af;">
            "৪০ কেজি বিরিয়ানি = আনুমানিক ৮০-১০০ জন শিশুর পুষ্টিকর আহার"
          </div>
          <p style="font-size: 9.5px; color: #64748b; margin-top: 4px;">
            খাবারের বিভাগ অনুযায়ী (ভাত, খিচুড়ি, স্ন্যাক্স, সবজি) কনভার্সন ফ্যাক্টর স্বয়ংক্রিয়ভাবে পরিবর্তিত হয়।
          </p>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 11px;">
        <div class="card card-amber">
          <h4 style="color: #b45309; margin-bottom: 4px; font-size: 11.5px;">📍 ৩. রাডার প্রোক্সিমিটি ও ইন্টারঅ্যাক্টিভ ম্যাপ ফিল্টার</h4>
          <p style="font-size: 10.5px; color: #334155; line-height: 1.4;">
            ঢাকা শহরের জ্যাম একটি বড় চ্যালেঞ্জ। তাই Leaflet ম্যাপের মাধ্যমে এনজিও তাদের সেন্টার থেকে <strong>৩ কিমি, ৫ কিমি বা ১০ কিমি</strong> রেডিয়াসের ভেতরের খাবার দ্রুত দেখতে পারে।
          </p>
          <ul style="margin-top: 5px; font-size: 10px; padding-left: 14px;">
            <li>বাড্ডা, রামপুরা, গুলশান, বনানী জোন অনুযায়ী হাইপার-লোকাল ক্লাস্টারিং।</li>
            <li>দূরত্ব বেশি হলে ওয়ার্নিং দেয় যাতে খাবার নষ্ট হওয়ার আগে সংগ্রহ সম্ভব হয়।</li>
          </ul>
        </div>

        <div class="card card-rose">
          <h4 style="color: #be123c; margin-bottom: 4px; font-size: 11.5px;">⏰ ৪. লাইভ রেসকিউ ক্লক ও আর্জেন্ট অ্যালার্টস</h4>
          <p style="font-size: 10.5px; color: #334155; line-height: 1.4;">
            যেসব খাবারের নিরাপদ খাওয়ার মেয়াদ ২ ঘণ্টার নিচে নেমে যায়, সেগুলোকে <strong>🚨 অতি জরুরি রেসকিউ মিশন</strong> হিসেবে ফ্ল্যাগ করা হয়।
          </p>
          <ul style="margin-top: 5px; font-size: 10px; padding-left: 14px;">
            <li>কাউন্টডাউন টাইমার প্রতি সেকেন্ডে পালস করে।</li>
            <li>কাছের সকল সক্রিয় ভলান্টিয়ারের ফোনে হাই-প্রায়োরিটি অডিও/পুশ অ্যালার্ট যায়।</li>
          </ul>
        </div>
      </div>

      <div class="card" style="background: #faf5ff; border: 1.5px solid #d8b4fe; margin-bottom: 10px;">
        <h4 style="color: #6b21a8; margin-bottom: 4px; font-size: 11.5px;">🌱 ৫. স্বয়ংক্রিয় সিএসআর ও এনভায়রনমেন্টাল ইমপ্যাক্ট ক্যালকুলেটর</h4>
        <p style="font-size: 10.5px; color: #4c1d95; line-height: 1.45;">
          প্রতিটি খাদ্য উদ্ধারের পর সিস্টেম আন্তর্জাতিক কার্বন ও পানি কনজারভেশন ফর্মুলা দিয়ে পরিবেশগত প্রভাব হিসাব করে:
        </p>
        <div class="grid-3" style="margin-top: 6px;">
          <div style="background: #ffffff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 6px; text-align: center;">
            <div style="font-size: 13px; font-weight: 800; color: #7e22ce;">১,২৪০+</div>
            <div style="font-size: 9px; color: #6b21a8; font-weight: 600;">বাঁচানো আহার (Meals)</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 6px; text-align: center;">
            <div style="font-size: 13px; font-weight: 800; color: #059669;">২.৮ টন</div>
            <div style="font-size: 9px; color: #047857; font-weight: 600;">CO₂ গ্যাস প্রতিরোধ</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 6px; text-align: center;">
            <div style="font-size: 13px; font-weight: 800; color: #2563eb;">১,৪০,০০০ লি.</div>
            <div style="font-size: 9px; color: #1d4ed8; font-weight: 600;">পানি অপচয় রক্ষা</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>ShareBite BD &bull; Smart Surplus Food Rescue Network</div>
      <div>Page 4 of 8</div>
    </div>
  </div>

  <!-- ================= PAGE 5: TECH STACK & ENGINEERING ARCHITECTURE ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">ShareBite BD &bull; Section 04</div>
      <div>Technology Stack & Engineering Architecture</div>
    </div>

    <div class="page-content">
      <div class="section-eyebrow">Technical Architecture</div>
      <h2 class="section-title">৪. টেকনোলজি স্ট্যাক ও সিস্টেম আর্কিটেকচার</h2>
      <p class="section-subtitle">আধুনিক এন্টারপ্রাইজ গ্রেড প্রযুক্তি দিয়ে নির্মিত মজবুত সফটওয়্যার ফ্রেমওয়ার্ক</p>

      <div class="grid-2" style="margin-bottom: 11px;">
        <div class="card">
          <strong style="color: #0f172a; font-size: 11px;">💻 ফ্রন্টএন্ড আর্কিটেকচার (Client Layer)</strong>
          <ul style="font-size: 10px; margin-top: 5px; padding-left: 14px;">
            <li><strong>Next.js 16 (App Router):</strong> সার্ভার কম্পোনেন্টস ও লাইটনিং-ফাস্ট রাউটিং।</li>
            <li><strong>React 19 & TypeScript:</strong> জিরো রানটাইম টাইপ এরর সহ শক্তিশালি স্টেট ম্যানেজমেন্ট।</li>
            <li><strong>Tailwind CSS v4:</strong> মডার্ন মিনিমালিস্ট ডিজাইন ও ফ্লুইড রেসপন্সিভনেস।</li>
            <li><strong>Lucide React Icons:</strong> লাইটওয়েট ভেক্টর আইকনোগ্রাফি।</li>
            <li><strong>Leaflet & OpenStreetMap:</strong> ফ্রি, ওপেন-সোর্স জিও-ম্যাপিং ইন্টারফেস।</li>
          </ul>
        </div>

        <div class="card">
          <strong style="color: #0f172a; font-size: 11px;">🗄️ ব্যাকএন্ড ও ডেটা লেয়ার (Persistence Layer)</strong>
          <ul style="font-size: 10px; margin-top: 5px; padding-left: 14px;">
            <li><strong>Prisma ORM:</strong> টাইপ-সেফ কুয়েরি বিল্ডার ও ডেটা মাইগ্রেশন ইঞ্জিন।</li>
            <li><strong>PostgreSQL Database:</strong> রিলেশনাল ডেটাবেজ (Supabase / Neon সাপোর্টেড)।</li>
            <li><strong>Offline-First Mock App Store:</strong> ইন্টারনেট বা ডাটাবেজ বিচ্ছিন্ন থাকলেও ডেমো ও প্রজেক্ট প্রেজেন্টেশন সর্বদা সচল থাকবে।</li>
            <li><strong>Zod Validation:</strong> স্ট্রিক্ট ইনপুট স্যানিটাইজেশন ও নিরাপত্তা চেক।</li>
          </ul>
        </div>
      </div>

      <h3 style="font-size: 12px; margin-bottom: 6px;">📐 ডাটাবেজ রিলেশনাল মডেল (Key Data Entities)</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 20%;">মডেল / টেবিল</th>
            <th style="width: 35%;">মূল ফিল্ডসমূহ</th>
            <th style="width: 45%;">উদ্দেশ্য ও ভূমিকা</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>User & Profile</strong></td>
            <td>id, email, role, phone, verificationStatus</td>
            <td>৪টি ভিন্ন রোল (Donor, NGO, Volunteer, Admin) নিয়ন্ত্রণ ও অডিট ট্রেইল।</td>
          </tr>
          <tr>
            <td><strong>Donation</strong></td>
            <td>category, quantity, safePickupDeadline, priority</td>
            <td>উদ্বৃত্ত খাবারের প্রতিটি লটের সম্পূর্ণ মেটাডেটা ও নিরাপদ খাওয়ার মেয়াদ।</td>
          </tr>
          <tr>
            <td><strong>Claim</strong></td>
            <td>donationId, ngoProfileId, volunteerId, status</td>
            <td>এনজিও ক্লেইম, ভলান্টিয়ার অ্যাসাইনমেন্ট ও স্টেট মেশিন পরিচালনা।</td>
          </tr>
          <tr>
            <td><strong>SafetyDeclaration</strong></td>
            <td>freshlyPrepared, storedCorrectly, declaredAt</td>
            <td>BFSA খাদ্য নিরাপত্তা আইন অনুযায়ী দাতার স্বাক্ষরকৃত ডিজিটাল ডিক্লারেশন।</td>
          </tr>
          <tr>
            <td><strong>DeliveryReceipt</strong></td>
            <td>receivedAt, verificationToken, qrConfirmed</td>
            <td>হস্তান্তরের ডিজিটাল ওটিপি ও কিউআর স্ক্যান ভেরিফিকেশন প্রমাণ।</td>
          </tr>
          <tr>
            <td><strong>ImpactRecord</strong></td>
            <td>mealsRescued, co2PreventedKg, waterSavedLitres</td>
            <td>সিএসআর অডিট ও প্রাতিষ্ঠানিক পরিবেশগত সার্টিফিকেটের জন্য সঞ্চিত ডেটা।</td>
          </tr>
        </tbody>
      </table>

      <div class="card card-accent" style="margin-top: 6px;">
        <h4 style="color: #065f46; font-size: 11px; margin-bottom: 3px;">🔒 সিকিউরিটি ও রোল-বেসড অ্যাক্সেস কন্ট্রোল (RBAC):</h4>
        <p style="font-size: 10px; color: #334155; line-height: 1.4;">
          প্ল্যাটফর্মে দাতার সংবেদনশীল ঠিকানা ও যোগাযোগের নম্বর পাবলিকলি উন্মুক্ত থাকে না। কেবল যখন কোনো <strong>ভেরিফায়েড এনজিও</strong> খাবারটি ক্লেইম করে এবং নির্ধারিত রাইডার বরাদ্দ হয়, তখনই নিরাপদ হ্যান্ডওভারের জন্য ঠিকানা উন্মুক্ত করা হয়।
        </p>
      </div>
    </div>

    <div class="page-footer">
      <div>ShareBite BD &bull; Smart Surplus Food Rescue Network</div>
      <div>Page 5 of 8</div>
    </div>
  </div>

  <!-- ================= PAGE 6: ROADMAP & IMPLEMENTATION ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">ShareBite BD &bull; Section 05</div>
      <div>Implementation Roadmap & Pilot Testing Plan</div>
    </div>

    <div class="page-content">
      <div class="section-eyebrow">Project Roadmap & Milestones</div>
      <h2 class="section-title">৫. বাস্তবায়ন রোডম্যাপ ও পাইলট টেস্টিং প্ল্যান</h2>
      <p class="section-subtitle">১৬ সপ্তাহের সুনির্দিষ্ট এজাইল স্প্রিন্ট প্ল্যান ও ক্যাম্পাস টেস্টরান</p>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
        <div class="card card-accent">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #065f46; font-size: 11px;">স্প্রিন্ট ১: ফাউন্ডেশন ও ডিজাইন সিস্টেম (সপ্তাহ ১ - ৪)</strong>
            <span class="badge badge-green">Sprint 1</span>
          </div>
          <p style="font-size: 10px; color: #334155; margin-top: 3px;">
            সিস্টেম আর্কিটেকচার তৈরি, রেসপন্সিভ ৩-পোর্টাল লেআউট, UIU থিমযুক্ত ড্যাশবোর্ড, টাইপস্ক্রিপ্ট ইন্টারফেস ও ডেটাবেজ স্কিমা চূড়ান্তকরণ।
          </p>
        </div>

        <div class="card card-blue">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #1d4ed8; font-size: 11px;">স্প্রিন্ট ২: কোর ইঞ্জিন, সেফটি মিটার ও ওটিপি ফ্লো (সপ্তাহ ৫ - ৮)</strong>
            <span class="badge badge-blue">Sprint 2</span>
          </div>
          <p style="font-size: 10px; color: #334155; margin-top: 3px;">
            AI Spoilage & Safety Meter ক্যালকুলেশন, স্মার্ট মিল কনভার্টার, Leaflet রাডার ম্যাপ, ওটিপি হ্যান্ডওভার প্রটোকল এবং রিয়েল-টাইম ক্লেইম স্টেট মেশিন ডেভেলপমেন্ট।
          </p>
        </div>

        <div class="card card-amber">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #b45309; font-size: 11px;">স্প্রিন্ট ৩: লাইভ ক্যাম্পাস পাইলট রান (সপ্তাহ ৯ - ১২)</strong>
            <span class="badge badge-amber">Sprint 3</span>
          </div>
          <p style="font-size: 10px; color: #334155; margin-top: 3px;">
            UIU সেন্ট্রাল ক্যাফেটেরিয়া এবং বাড্ডা এলাকার ২টি লোকাল রেস্তোরাঁ থেকে পরীক্ষামূলক উদ্বৃত্ত খাবার সংগ্রহ। মাস্তুল ফাউন্ডেশনের সাথে লাইভ ডেলিভারি টেস্ট।
          </p>
        </div>

        <div class="card card-accent" style="border-left-color: #7c3aed;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #5b21b6; font-size: 11px;">স্প্রিন্ট ৪: অ্যানালিটিক্স, অডিট ও প্রজেক্ট ডিফেন্স (সপ্তাহ ১৩ - ১৬)</strong>
            <span class="badge" style="background: #ede9fe; color: #6d28d9;">Sprint 4</span>
          </div>
          <p style="font-size: 10px; color: #334155; margin-top: 3px;">
            সিএসআর ও পরিবেশগত ইমপ্যাক্ট সার্টিফিকেট জেনারেশন, সিকিউরিটি অডিট, প্রজেক্ট রিপোর্ট রাইটিং এবং এক্সটার্নাল ডিফেন্স প্রেজেন্টেশন প্রস্তুতকরণ।
          </p>
        </div>
      </div>

      <div class="card" style="background: #f8fafc; border: 1.5px solid #cbd5e1;">
        <h4 style="font-size: 11.5px; color: #0f172a; margin-bottom: 5px;">🎯 আমাদের বাস্তবসম্মত ক্যাম্পাস পাইলট প্ল্যান (Zero Budget Pilot):</h4>
        <div class="grid-3" style="font-size: 10px;">
          <div>
            <strong style="color: #065f46;">ধাপ ১: খাদ্য উৎস</strong>
            <p style="color: #64748b; margin-top: 2px;">UIU সেন্ট্রাল ক্যাফেটেরিয়া ও মেহরান মেহমানখানা (বাড্ডা)।</p>
          </div>
          <div>
            <strong style="color: #1d4ed8;">ধাপ ২: পার্টনার এনজিও</strong>
            <p style="color: #64748b; margin-top: 2px;">মাস্তুল ফাউন্ডেশন (রামপুরা/বাড্ডা শেল্টার) ও বিদ্যানন্দ।</p>
          </div>
          <div>
            <strong style="color: #b45309;">ধাপ ৩: ভলান্টিয়ার টিম</strong>
            <p style="color: #64748b; margin-top: 2px;">ক্যাম্পাসের ৫ জন বাইকার/সাইক্লিস্ট স্টুডেন্ট ভলান্টিয়ার।</p>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>ShareBite BD &bull; Smart Surplus Food Rescue Network</div>
      <div>Page 6 of 8</div>
    </div>
  </div>

  <!-- ================= PAGE 7: TEAM ROLES & CAREER BENEFITS ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">ShareBite BD &bull; Section 06</div>
      <div>Team Role Allocation & Career Impact</div>
    </div>

    <div class="page-content">
      <div class="section-eyebrow">Team Collaboration & Skills Growth</div>
      <h2 class="section-title">৬. দলের দায়িত্ব বণ্টন ও ক্যারিয়ারে এর প্রভাব</h2>
      <p class="section-subtitle">গ্রুপের প্রত্যেক সদস্যের জন্য স্পষ্ট কাজের পরিধি এবং রেজুমির বিশাল টেকনিক্যাল ভ্যালু</p>

      <table style="margin-bottom: 12px;">
        <thead>
          <tr>
            <th style="width: 25%;">সদস্য / রোল</th>
            <th style="width: 45%;">নির্দিষ্ট দায়িত্বসমূহ (Work Breakdown)</th>
            <th style="width: 30%;">রেজুমি ও চাকরির পরীক্ষায় শেখার সুযোগ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Member 1</strong><br>
              <span style="font-size: 9px; color: #059669; font-weight: 700;">Frontend & UX Finisher</span>
            </td>
            <td>
              &bull; Next.js 16 রেসপন্সিভ ড্যাশবোর্ড ও ৩টি পোর্টাল লেআউট<br>
              &bull; AI Spoilage মিটার ডায়াল ও স্মার্ট কোয়ান্টিটি কনভার্টার<br>
              &bull; Tailwind CSS v4 থিমিং ও মসৃণ ইউআই/ইউএক্স অপ্টিমাইজেশন
            </td>
            <td>
              &bull; Next.js 16 App Router<br>
              &bull; Modern Component Design<br>
              &bull; Enterprise UI Patterns
            </td>
          </tr>
          <tr>
            <td>
              <strong>Member 2</strong><br>
              <span style="font-size: 9px; color: #2563eb; font-weight: 700;">Backend & Database Lead</span>
            </td>
            <td>
              &bull; Prisma ORM ডেটাবেজ স্কিমা ও মাইগ্রেশন স্ক্রিপ্ট<br>
              &bull; অফলাইন-ফার্স্ট মক স্টেট ও সার্ভিস ইন্টিগ্রেশন<br>
              &bull; Zod স্কিমা ভ্যালিডেশন ও সিকিউর ডেটা ট্রানজেকশন
            </td>
            <td>
              &bull; Relational Data Modeling<br>
              &bull; State Machine Engineering<br>
              &bull; Robust REST Architecture
            </td>
          </tr>
          <tr>
            <td>
              <strong>Member 3</strong><br>
              <span style="font-size: 9px; color: #d97706; font-weight: 700;">Geo-Logistics & Realtime Lead</span>
            </td>
            <td>
              &bull; Leaflet ম্যাপ ইন্টিগ্রেশন ও ঢাকা মেট্রো রেডিয়াস ফিল্টারিং<br>
              &bull; লাইভ রেসকিউ ক্লক ও কাউন্টডাউন টাইমার ইঞ্জিন<br>
              &bull; ৪-ডিজিটের হ্যান্ডওভার ওটিপি ও কিউআর জেনারেশন
            </td>
            <td>
              &bull; Spatial Geolocation & GIS<br>
              &bull; Real-time Event Triggers<br>
              &bull; Micro-logistics Dispatch
            </td>
          </tr>
          <tr>
            <td>
              <strong>Member 4</strong><br>
              <span style="font-size: 9px; color: #7c3aed; font-weight: 700;">QA, Security & Presentation</span>
            </td>
            <td>
              &bull; BFSA খাদ্য নিরাপত্তা আইন কমপ্লায়েন্স অডিট ট্রেইল<br>
              &bull; এজ-কেস টেস্টিং, সিস্টেম ভেরিফিকেশন ও পাইলট সমন্বয়<br>
              &bull; প্রজেক্ট প্রস্তাবনা, রিসার্চ রিপোর্ট ও ডিফেন্স প্রেজেন্টেশন
            </td>
            <td>
              &bull; Software Quality Assurance<br>
              &bull; Food Safety Regulatory Standards<br>
              &bull; Technical Documentation
            </td>
          </tr>
        </tbody>
      </table>

      <h3 style="font-size: 12px; margin-bottom: 6px;">🏆 কেন এই প্রজেক্টটি আমাদের সবার জন্য "উইন-উইন" (Win-Win)?</h3>
      <div class="grid-3">
        <div class="card card-accent">
          <strong style="color: #065f46; font-size: 10.5px;">১. হাই-স্কোরিং ক্যাপস্টন গ্রেড</strong>
          <p style="font-size: 9.5px; color: #475569; margin-top: 3px;">
            শিক্ষক ও এক্সটার্নালরা কাল্পনিক কোনো ই-কমার্সের চেয়ে বাস্তব সমাজের সমস্যার প্রযুক্তিগত সমাধানে সবচেয়ে বেশি নম্বর প্রদান করেন।
          </p>
        </div>
        <div class="card card-amber">
          <strong style="color: #b45309; font-size: 10.5px;">২. হ্যাকাথন ও জাতীয় পুরস্কার</strong>
          <p style="font-size: 9.5px; color: #475569; margin-top: 3px;">
            বুয়েট, ব্র্যাক বা জাতীয় আইসিটি ইনোভেশন অ্যাওয়ার্ডে জাতিসংঘের SDG-ভিত্তিক সোশ্যাল-টেক প্রজেক্টগুলো সর্বদা চ্যাম্পিয়ন তালিকায় থাকে।
          </p>
        </div>
        <div class="card card-blue">
          <strong style="color: #1d4ed8; font-size: 10.5px;">৩. টেকনিক্যাল ইন্টারভিউ অ্যাডভান্টেজ</strong>
          <p style="font-size: 9.5px; color: #475569; margin-top: 3px;">
            ৩টি ভিন্ন রোল (RBAC), জিও-লোকেশন, টাইম-সেনসিটিভ স্টেট মেশিন ও ওটিপি সিকিউরিটির অভিজ্ঞতা যেকোনো ইন্টারভিউতে অন্যদের থেকে এগিয়ে রাখবে।
          </p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>ShareBite BD &bull; Smart Surplus Food Rescue Network</div>
      <div>Page 7 of 8</div>
    </div>
  </div>

  <!-- ================= PAGE 8: FEASIBILITY, RISKS & CONCLUSION ================= -->
  <div class="page">
    <div class="page-header">
      <div class="brand">ShareBite BD &bull; Section 07</div>
      <div>Feasibility, Risk Management & Conclusion</div>
    </div>

    <div class="page-content">
      <div class="section-eyebrow">Feasibility & Final Commitment</div>
      <h2 class="section-title">৭. অর্থনৈতিক সম্ভাব্যতা, ঝুঁকি ব্যবস্থাপনা ও সমাপনী</h2>
      <p class="section-subtitle">জিরো-বাজেট ডেপ্লয়মেন্ট স্ট্র্যাটেজি এবং টিম কমিটমেন্ট</p>

      <div class="grid-2" style="margin-bottom: 11px;">
        <div class="card card-accent">
          <strong style="color: #065f46; font-size: 11px;">💰 অর্থনৈতিক সম্ভাব্যতা (Zero Infrastructure Cost)</strong>
          <ul style="font-size: 9.5px; margin-top: 4px; padding-left: 14px;">
            <li><strong>Frontend Hosting:</strong> Vercel Global Edge (বিনামূল্যে স্টুডেন্ট টায়ার)।</li>
            <li><strong>Database:</strong> Neon / Supabase Serverless PostgreSQL (ফ্রি ক্লাউড টায়ার)।</li>
            <li><strong>Maps API:</strong> Leaflet & OpenStreetMap (১০০% ফ্রি ওপেন-সোর্স, নো ক্রেডিট কার্ড দরকার)।</li>
            <li><strong>মোট সফটওয়্যার খরচ:</strong> ৳০ (শূন্য টাকা)। সম্পূর্ণ ওপেন-সোর্স প্রযুক্তি।</li>
          </ul>
        </div>

        <div class="card card-amber">
          <strong style="color: #b45309; font-size: 11px;">⚖️ ঝুঁকি ব্যবস্থাপনা মেকানিক্স (Risk Management)</strong>
          <ul style="font-size: 9.5px; margin-top: 4px; padding-left: 14px;">
            <li><strong>খাবারের মান ঝুঁকি:</strong> দাতার জন্য বাধ্যতামূলক BFSA সেফটি ডিক্লারেশন চেকলিস্ট।</li>
            <li><strong>ট্রাফিক বিলম্ব:</strong> ১৫ কিমির পরিবর্তে সর্বোচ্চ ৩-৫ কিমি ক্লোজ রেডিয়াসে খাবার ম্যাচিং।</li>
            <li><strong>ভলান্টিয়ার রাইডার অনুপস্থিতি:</strong> নির্ধারিত সময়ে রাইডার না পেলে সরাসরি এনজিও প্রতিনিধিকে অ্যালার্ট।</li>
          </ul>
        </div>
      </div>

      <div class="card" style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 2px solid #059669; padding: 12px 14px; margin-bottom: 12px;">
        <h3 style="color: #065f46; font-size: 13.5px; margin-bottom: 4px;">🚀 খাদ্য অপচয় ডাস্টবিনে নয়, ক্ষুধার্ত মানুষের পাতে!</h3>
        <p style="font-size: 10.5px; color: #1e293b; line-height: 1.5;">
          "আমরা এমন কোনো প্রজেক্ট তৈরি করছি না যা শুধু পরীক্ষার খাতায় জমা দিয়ে ফাইলেই হারিয়ে যাবে। <strong>ShareBite BD</strong> এমন একটি প্রজেক্ট যা ঢাকা শহরের অনাহারী মানুষের মুখে হাসি ফোটাবে, পরিবেশ রক্ষা করবে এবং একই সাথে সফটওয়্যার ইঞ্জিনিয়ার হিসেবে আমাদের প্রত্যেককে গর্বিত করবে। আমরা একসাথে এই ইতিহাসটি তৈরি করতে প্রস্তুত।"
        </p>
      </div>

      <div style="border-top: 1.5px dashed #cbd5e1; padding-top: 10px;">
        <h4 style="font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 12px;">🤝 দলের সম্মিলিত সম্মতি ও স্বাক্ষর (Team Endorsement):</h4>
        <div class="grid-4" style="text-align: center; font-size: 9.5px;">
          <div>
            <div style="border-bottom: 1px solid #94a3b8; height: 26px; margin-bottom: 4px;"></div>
            <strong>Member 1 (Lead)</strong>
            <p style="color: #64748b;">Frontend Architect</p>
          </div>
          <div>
            <div style="border-bottom: 1px solid #94a3b8; height: 26px; margin-bottom: 4px;"></div>
            <strong>Member 2</strong>
            <p style="color: #64748b;">Backend Lead</p>
          </div>
          <div>
            <div style="border-bottom: 1px solid #94a3b8; height: 26px; margin-bottom: 4px;"></div>
            <strong>Member 3</strong>
            <p style="color: #64748b;">Geo-Logistics Lead</p>
          </div>
          <div>
            <div style="border-bottom: 1px solid #94a3b8; height: 26px; margin-bottom: 4px;"></div>
            <strong>Member 4</strong>
            <p style="color: #64748b;">QA & Security Lead</p>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <div>ShareBite BD &bull; Smart Surplus Food Rescue Network</div>
      <div>Page 8 of 8 &bull; Proposal Document Complete</div>
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent, "utf8");
console.log("HTML proposal generated at:", htmlPath);

const chromePath = "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe";
console.log("Rendering PDF via headless Chrome...");

try {
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--run-all-compositor-stages-before-draw",
    `--print-to-pdf=${pdfPath}`,
    "--no-pdf-header-footer",
    `file:///${htmlPath.replace(/\\\\/g, "/")}`,
  ];

  execFileSync(chromePath, args, { stdio: "inherit" });

  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`SUCCESS! Proposal PDF created at: ${pdfPath}`);
    console.log(`PDF Size: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.error("PDF was not created.");
    process.exit(1);
  }
} catch (err) {
  console.error("Error generating PDF:", err);
  process.exit(1);
}
