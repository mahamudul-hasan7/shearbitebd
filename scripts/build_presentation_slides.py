# -*- coding: utf-8 -*-
import os
import sys
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShareBite BD — SE Lab Project Proposal Presentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Hind+Siliguri:wght@500;600;700&display=swap');

    @page {
      size: A4 landscape;
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
      font-family: 'Inter', 'Hind Siliguri', system-ui, -apple-system, sans-serif;
      background-color: #0b1329;
      color: #1e293b;
      line-height: 1.5;
    }

    /* Presentation Deck Container */
    .deck {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 20px 0;
    }

    /* Individual Slide: Fixed A4 Landscape (297mm x 210mm) */
    .slide {
      width: 297mm;
      height: 210mm;
      min-height: 210mm;
      max-height: 210mm;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      position: relative;
      background: #ffffff;
      padding: 14mm 18mm 12mm 18mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    /* Slide Header */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }

    .slide-header .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      color: #064e3b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .slide-header .section-tag {
      font-size: 11px;
      font-weight: 700;
      color: #059669;
      background: #ecfdf5;
      padding: 3px 10px;
      border-radius: 9999px;
      border: 1px solid #a7f3d0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Slide Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1.5px solid #e2e8f0;
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
    }

    /* Content Area */
    .slide-content {
      flex: 1;
      padding: 10px 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .slide-title {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .slide-subtitle {
      font-size: 13px;
      color: #475569;
      font-weight: 500;
      margin-bottom: 12px;
    }

    /* Grids & Cards */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .card {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
    }

    .card-accent {
      border-left: 4.5px solid #059669;
      background: #f0fdf4;
    }

    .card-rose {
      border-left: 4.5px solid #e11d48;
      background: #fff1f2;
    }

    .card-blue {
      border-left: 4.5px solid #2563eb;
      background: #eff6ff;
    }

    .card-amber {
      border-left: 4.5px solid #d97706;
      background: #fffbeb;
    }

    .card-purple {
      border-left: 4.5px solid #7c3aed;
      background: #faf5ff;
    }

    .card h4 {
      font-size: 14px;
      font-weight: 800;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card p {
      font-size: 12px;
      color: #334155;
      line-height: 1.5;
    }

    /* Stats Box */
    .stat-box {
      text-align: center;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      padding: 12px 10px;
    }

    .stat-val {
      font-size: 26px;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 3px;
    }

    .stat-label {
      font-size: 11.5px;
      font-weight: 700;
      color: #334155;
    }

    .stat-sub {
      font-size: 10px;
      color: #64748b;
      margin-top: 3px;
    }

    /* One Liner Hero Callout */
    .one-liner-box {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
      color: #ffffff;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 14px;
      box-shadow: 0 4px 12px rgba(6, 78, 59, 0.2);
    }

    .one-liner-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #a7f3d0;
      font-weight: 800;
      margin-bottom: 5px;
    }

    .one-liner-text {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.45;
    }

    /* Title Slide Specific */
    .title-slide {
      background: linear-gradient(145deg, #064e3b 0%, #065f46 45%, #022c22 100%);
      color: #ffffff;
    }

    .title-slide .slide-header, .title-slide .slide-footer {
      border-color: rgba(255, 255, 255, 0.15);
      color: #a7f3d0;
    }

    .hero-title {
      font-size: 44px;
      font-weight: 900;
      letter-spacing: -1px;
      color: #ffffff;
      line-height: 1.1;
      margin-bottom: 8px;
    }

    .hero-title span {
      color: #34d399;
    }

    .hero-subtitle {
      font-size: 18px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .badge-pill {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      margin-right: 4px;
    }

    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-amber { background: #fef3c7; color: #b45309; }
    .badge-purple { background: #ede9fe; color: #6d28d9; }

    /* Timeline Stepper */
    .timeline-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .timeline-card {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-top: 4px solid #059669;
      border-radius: 9px;
      padding: 10px 12px;
    }

    .timeline-card h5 {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .timeline-card ul {
      font-size: 11px;
      color: #334155;
      padding-left: 14px;
    }

    .timeline-card li {
      margin-bottom: 3px;
    }

    /* Print view clean override */
    @media print {
      body {
        background: none;
      }
      .deck {
        padding: 0;
        gap: 0;
      }
      .slide {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>

  <div class="deck">

    <!-- ================= SLIDE 1: TITLE SLIDE ================= -->
    <section class="slide title-slide">
      <div class="slide-header">
        <div class="brand" style="color: #6ee7b7;">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#34d399"/>
            <path d="M22 36C20 33 19 30 19 26C19 20 23.5 16 28 16C30.5 16 32.5 17.5 33.5 19.5C34.5 17.5 36.5 16 39 16C43.5 16 48 20 48 26C48 30 46 34 42 38L33.5 46.5L25 38" stroke="#064e3b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="46" cy="18" r="8" fill="#f59e0b"/>
          </svg>
          <span>ShareBite BD</span>
        </div>
        <div>SOFTWARE ENGINEERING LAB &bull; PROJECT PROPOSAL</div>
      </div>

      <div class="slide-content">
        <div style="display: inline-block; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.25); padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #a7f3d0; margin-bottom: 12px; width: fit-content;">
          🚀 SE LAB 10-MINUTE PROJECT PROPOSAL DEFENSE
        </div>

        <h1 class="hero-title">ShareBite <span>BD</span></h1>
        <p class="hero-subtitle">Smart Surplus Food Rescue & Safety-Compliant Redistribution Network</p>

        <div style="background: rgba(2, 44, 34, 0.65); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 14px 18px; max-width: 750px; margin-top: 10px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #a7f3d0; font-weight: 800;">Target Pilot Zone</div>
              <div style="font-size: 12.5px; font-weight: 700; color: #ffffff; margin-top: 2px;">UIU Campus & Badda Metro</div>
            </div>
            <div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #a7f3d0; font-weight: 800;">SDG Alignment</div>
              <div style="font-size: 12.5px; font-weight: 700; color: #ffffff; margin-top: 2px;">SDG 2 (Zero Hunger) & 12</div>
            </div>
            <div>
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #a7f3d0; font-weight: 800;">Engineering Scope</div>
              <div style="font-size: 12.5px; font-weight: 700; color: #ffffff; margin-top: 2px;">Next.js, Prisma, Leaflet GIS</div>
            </div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Department of Computer Science & Engineering (CSE)</div>
        <div>Slide 1 of 7</div>
      </div>
    </section>

    <!-- ================= SLIDE 2: PROBLEM IDENTIFICATION ================= -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand">ShareBite BD</div>
        <div class="section-tag">Section 1: Problem Identification</div>
      </div>

      <div class="slide-content">
        <h2 class="slide-title">1. Problem Identification: What Problem Are We Solving?</h2>
        <p class="slide-subtitle">The real-world crisis of urban food waste vs. street hunger in Dhaka City</p>

        <div class="grid-2" style="margin-bottom: 12px;">
          <div class="card card-rose">
            <h4 style="color: #be123c;">⚠️ The Core Problem: Huge Waste While People Go Hungry</h4>
            <p>
              Every day, university cafeterias (like <strong>UIU Central Cafeteria</strong>), event caterers, and restaurants cook large batches of nutritious meals. At closing hours, massive pots of wholesome cooked food are discarded into municipal trash cans simply because donors have <strong>no fast, reliable channel to connect with local charities</strong>.
            </p>
          </div>

          <div class="card card-amber">
            <h4 style="color: #b45309;">⏱️ The 4-Hour "Life-or-Death" Biological Window</h4>
            <p>
              Cooked food is perishable. Under BFSA (Bangladesh Food Safety Authority) standards, warm cooked food must be safely consumed within <strong>4 hours</strong> before pathogenic bacteria multiply. Traditional phone calls and manual coordination take hours, causing food to spoil before it can even be picked up.
            </p>
          </div>
        </div>

        <div class="card card-accent">
          <h4 style="color: #065f46;">💡 Why Is This Problem Important & Interesting to Solve?</h4>
          <p>
            This is <strong>not a food shortage issue; it is a micro-logistics and real-time communication failure</strong>. The food already exists, and the hungry people are only 2–3 kilometers away. An intelligent, real-time software system can bridge this exact 4-hour gap and turn wasted food into immediate social relief.
          </p>
        </div>
      </div>

      <div class="slide-footer">
        <div>Software Engineering Lab Proposal &bull; 10-Minute Presentation</div>
        <div>Slide 2 of 7</div>
      </div>
    </section>

    <!-- ================= SLIDE 3: EVIDENCE & DATA ================= -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand">ShareBite BD</div>
        <div class="section-tag">Section 1: Evidence & Data</div>
      </div>

      <div class="slide-content">
        <h2 class="slide-title">1. Evidence & Data: Backed by Research & Impact</h2>
        <p class="slide-subtitle">Official statistics, biological benchmarks, and real-world impact potential</p>

        <div class="grid-4" style="margin-bottom: 14px;">
          <div class="stat-box" style="border-top: 4px solid #e11d48;">
            <div class="stat-val" style="color: #e11d48;">10.7M</div>
            <div class="stat-label">Tons Wasted Annually</div>
            <div class="stat-sub">UNEP Food Waste Index (Bangladesh)</div>
          </div>

          <div class="stat-box" style="border-top: 4px solid #d97706;">
            <div class="stat-val" style="color: #d97706;">4 Hours</div>
            <div class="stat-label">Biological Spoilage Window</div>
            <div class="stat-sub">Danger Zone (5°C to 60°C)</div>
          </div>

          <div class="stat-box" style="border-top: 4px solid #2563eb;">
            <div class="stat-val" style="color: #2563eb;">3.8M</div>
            <div class="stat-label">Urban Food-Insecure People</div>
            <div class="stat-sub">Slum dwellers & street children in Dhaka</div>
          </div>

          <div class="stat-box" style="border-top: 4px solid #059669;">
            <div class="stat-val" style="color: #059669;">0%</div>
            <div class="stat-label">Digital Traceability Today</div>
            <div class="stat-sub">Zero audit trails for corporate CSR</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="card card-blue">
            <h4 style="color: #1d4ed8;">🌍 Real-World Social & Healthcare Impact</h4>
            <ul style="font-size: 11.5px; color: #334155; padding-left: 16px; margin-top: 4px;">
              <li><strong>Zero Hunger (SDG 2):</strong> Redirects protein-rich, untouched hot meals to orphanages and daily-wage street laborers.</li>
              <li><strong>Health & Hygiene Protection:</strong> Enforces BFSA thermal holding standards (>65°C hot, <4°C cold) to eliminate food poisoning risks.</li>
            </ul>
          </div>

          <div class="card card-accent">
            <h4 style="color: #065f46;">🌱 Environmental & Climate Impact</h4>
            <ul style="font-size: 11.5px; color: #334155; padding-left: 16px; margin-top: 4px;">
              <li><strong>Methane Gas Reduction:</strong> Food decomposing in landfills is a leading emitter of greenhouse gases. Rescuing food directly prevents emissions.</li>
              <li><strong>Water Conservation:</strong> Every kilogram of rescued food preserves hundreds of liters of embedded agricultural water.</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Software Engineering Lab Proposal &bull; 10-Minute Presentation</div>
        <div>Slide 3 of 7</div>
      </div>
    </section>

    <!-- ================= SLIDE 4: SOLUTION APPROACH ================= -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand">ShareBite BD</div>
        <div class="section-tag">Section 2: Solution Approach</div>
      </div>

      <div class="slide-content">
        <h2 class="slide-title">2. Solution: The Idea & Architecture Approach</h2>
        <p class="slide-subtitle">A synchronized 3-sided micro-logistics platform designed for 15–30 minute rescue velocity</p>

        <!-- ONE SINGLE LINE -->
        <div class="one-liner-box">
          <div class="one-liner-label">🌟 The Project in One Single Line (Explainable to a kid or parent):</div>
          <div class="one-liner-text">
            "An Uber-like app where university cafeterias post extra cooked food, and nearby charities and student volunteers get an instant alert to pick it up and feed hungry people before it gets cold and goes bad!"
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">What Will the System Do? (The 3-Sided Hyper-Local Ecosystem):</h3>

        <div class="grid-3">
          <div class="card" style="border-top: 3.5px solid #059669;">
            <h4 style="color: #065f46;">🍲 1. Food Donor Portal</h4>
            <p style="font-size: 11.5px; color: #334155;">
              Cafeteria managers list extra meals in <strong>60 seconds</strong> with photos, food category, and cooking time. System calculates the remaining safe countdown.
            </p>
          </div>

          <div class="card" style="border-top: 3.5px solid #2563eb;">
            <h4 style="color: #1d4ed8;">🏢 2. NGO Discovery Hub</h4>
            <p style="font-size: 11.5px; color: #334155;">
              Verified charities (like Mastul, Bidyanondo) browse available batches on a <strong>real-time radar map</strong> (3–5 km) and claim food in 1-click.
            </p>
          </div>

          <div class="card" style="border-top: 3.5px solid #d97706;">
            <h4 style="color: #b45309;">🚴 3. Volunteer Command Hub</h4>
            <p style="font-size: 11.5px; color: #334155;">
              Nearby student cyclists and motorcycle riders receive instant rescue alerts on their daily commute, picking up and delivering meals with verified insulated boxes.
            </p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Software Engineering Lab Proposal &bull; 10-Minute Presentation</div>
        <div>Slide 4 of 7</div>
      </div>
    </section>

    <!-- ================= SLIDE 5: MAIN FEATURES ================= -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand">ShareBite BD</div>
        <div class="section-tag">Section 2: Main Features & Outputs</div>
      </div>

      <div class="slide-content">
        <h2 class="slide-title">2. Main Features: What Will the End System Perform?</h2>
        <p class="slide-subtitle">Idea-driven key functionalities solving real friction in food redistribution</p>

        <div class="grid-2" style="margin-bottom: 12px;">
          <div class="card card-accent">
            <h4 style="color: #065f46;">⚡ 1. 60-Sec Listing & AI Spoilage & Safety Meter</h4>
            <p>
              When a donor logs hot food, a dynamic speedometer dial displays real-time biological safety: <em>"Temperature: >65°C (Safe) | Pickup Window: 2h 15m remaining"</em>. Automatically converts kilograms into estimated human meals (e.g. <em>"40 kg Biryani = 80–100 children fed"</em>).
            </p>
          </div>

          <div class="card card-blue">
            <h4 style="color: #1d4ed8;">📍 2. Radar Proximity Map & Smart Radius Filtering</h4>
            <p>
              Accounting for Dhaka traffic, NGOs filter donations strictly within <strong>3 km or 5 km</strong>. Meals nearing expiration (<2 hours) flash as <strong>🚨 Urgent Rescues</strong>, triggering priority sound and push alerts.
            </p>
          </div>
        </div>

        <div class="grid-2">
          <div class="card card-amber">
            <h4 style="color: #b45309;">🚴 3. Uber-Style Volunteer Dispatch & Live Route</h4>
            <p>
              Crowdsources campus student cyclists and bikers. Riders view turn-by-turn routes to the cafeteria back-gate, verify food hygiene checklists, and navigate to the beneficiary shelter.
            </p>
          </div>

          <div class="card card-purple">
            <h4 style="color: #6b21a8;">🔒 4. 4-Digit OTP & QR Code Anti-Fraud Protocol</h4>
            <p>
              Donors release food only after matching the volunteer's <strong>4-digit secret PIN</strong> (e.g. 7429). The receiving shelter scans a <strong>tamper-proof QR token</strong> on arrival, ensuring zero theft and 100% audit transparency.
            </p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Software Engineering Lab Proposal &bull; 10-Minute Presentation</div>
        <div>Slide 5 of 7</div>
      </div>
    </section>

    <!-- ================= SLIDE 6: PLAN OF ACTION ================= -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand">ShareBite BD</div>
        <div class="section-tag">Section 3: Plan of Action (Tech Overview)</div>
      </div>

      <div class="slide-content">
        <h2 class="slide-title">3. Plan of Action: High-Level Technology Overview</h2>
        <p class="slide-subtitle">Industry-standard, modern engineering stack chosen for speed, reliability, and zero hosting cost</p>

        <div class="grid-3" style="margin-bottom: 12px;">
          <div class="card">
            <h4 style="color: #0f172a;">💻 Frontend Framework</h4>
            <div style="margin: 6px 0;">
              <span class="badge-pill badge-green">Next.js 16</span>
              <span class="badge-pill badge-green">React 19</span>
              <span class="badge-pill badge-blue">Tailwind CSS v4</span>
            </div>
            <p style="font-size: 11px;">
              <strong>Why:</strong> Server-Side Rendering (SSR) delivers sub-100ms load times and seamless responsive layout on mobile browsers without native app friction.
            </p>
          </div>

          <div class="card">
            <h4 style="color: #0f172a;">🗄️ Backend & Database</h4>
            <div style="margin: 6px 0;">
              <span class="badge-pill badge-blue">Prisma ORM</span>
              <span class="badge-pill badge-blue">PostgreSQL</span>
              <span class="badge-pill badge-purple">Zod</span>
            </div>
            <p style="font-size: 11px;">
              <strong>Why:</strong> Strongly-typed relational data models for Users, Donations, Claims, and Delivery Receipts with atomic state transactions.
            </p>
          </div>

          <div class="card">
            <h4 style="color: #0f172a;">🗺️ GIS Maps & Real-time</h4>
            <div style="margin: 6px 0;">
              <span class="badge-pill badge-amber">Leaflet.js</span>
              <span class="badge-pill badge-amber">OpenStreetMap</span>
              <span class="badge-pill badge-green">Lucide Icons</span>
            </div>
            <p style="font-size: 11px;">
              <strong>Why:</strong> 100% free, open-source geospatial mapping. Uses Haversine distance algorithms without expensive Google Maps API credit requirements.
            </p>
          </div>
        </div>

        <div class="card card-accent">
          <h4 style="color: #065f46;">🛠️ Feature-Wise Implementation Architecture:</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 11px; margin-top: 4px;">
            <div><strong>Donor Listing:</strong> Form state + Countdown timer engine</div>
            <div><strong>NGO Discovery:</strong> Leaflet radar + Spatial radius filter</div>
            <div><strong>Rider Dispatch:</strong> Real-time status state machine</div>
            <div><strong>Security Handover:</strong> 4-digit OTP hashing + QR confirmation</div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Software Engineering Lab Proposal &bull; 10-Minute Presentation</div>
        <div>Slide 6 of 7</div>
      </div>
    </section>

    <!-- ================= SLIDE 7: TIMELINE ================= -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand">ShareBite BD</div>
        <div class="section-tag">Section 4: Timeline & Conclusion</div>
      </div>

      <div class="slide-content">
        <h2 class="slide-title">4. Project Timeline: 16-Week Implementation Roadmap</h2>
        <p class="slide-subtitle">Structured semester milestones leading to a live campus pilot and defense readiness</p>

        <div class="timeline-grid" style="margin-bottom: 14px;">
          <div class="timeline-card">
            <div style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase;">Weeks 1 – 4</div>
            <h5>Sprint 1: Architecture & UX</h5>
            <ul>
              <li>Software Requirements (SRS)</li>
              <li>Prisma database schema</li>
              <li>Responsive 3-portal UI shells</li>
              <li>Role-based access (RBAC)</li>
            </ul>
          </div>

          <div class="timeline-card" style="border-top-color: #2563eb;">
            <div style="font-size: 10px; font-weight: 800; color: #2563eb; text-transform: uppercase;">Weeks 5 – 8</div>
            <h5>Sprint 2: Core Rescue Engine</h5>
            <ul>
              <li>AI Spoilage & countdown logic</li>
              <li>Leaflet Radar GIS integration</li>
              <li>4-Digit OTP & QR verification</li>
              <li>State machine transactions</li>
            </ul>
          </div>

          <div class="timeline-card" style="border-top-color: #d97706;">
            <div style="font-size: 10px; font-weight: 800; color: #d97706; text-transform: uppercase;">Weeks 9 – 12</div>
            <h5>Sprint 3: Live Campus Pilot</h5>
            <ul>
              <li>UIU Cafeteria pilot integration</li>
              <li>Badda local eatery onboarding</li>
              <li>Student volunteer test runs</li>
              <li>Mastul Foundation live trial</li>
            </ul>
          </div>

          <div class="timeline-card" style="border-top-color: #7c3aed;">
            <div style="font-size: 10px; font-weight: 800; color: #7c3aed; text-transform: uppercase;">Weeks 13 – 16</div>
            <h5>Sprint 4: Testing & Defense</h5>
            <ul>
              <li>Unit & integration testing</li>
              <li>CSR Impact analytics generation</li>
              <li>Security audit & bug fixing</li>
              <li>Final report & project defense</li>
            </ul>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 2px solid #059669; border-radius: 10px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #065f46;">🚀 Ready for Execution & Social Impact</div>
            <div style="font-size: 11.5px; color: #334155; margin-top: 2px;">
              ShareBite BD transforms edible food waste into immediate human sustenance through rapid, modern software engineering.
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: 900; color: #064e3b;">Thank You!</div>
            <div style="font-size: 11px; font-weight: 700; color: #059669;">Floor Open for Q&A 🤝</div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Software Engineering Lab Proposal &bull; 10-Minute Presentation</div>
        <div>Slide 7 of 7 &bull; Final Slide</div>
      </div>
    </section>

  </div>

</body>
</html>
"""

workspace = os.getcwd()
html_path = os.path.join(workspace, "ShareBite_BD_SE_Lab_Presentation.html")
pdf_path = os.path.join(workspace, "ShareBite_BD_SE_Lab_Presentation.pdf")

with open(html_path, "wb") as f:
    f.write(html_content.encode("utf-8"))

print(f"Presentation HTML written in UTF-8 ({len(html_content.encode('utf-8'))} bytes)")

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
args = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_path}",
    "--no-pdf-header-footer",
    f"file:///{html_path.replace(os.sep, '/')}",
]

res = subprocess.run(args, capture_output=True, text=True)
if os.path.exists(pdf_path):
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"SUCCESS: SE Lab Presentation PDF created ({size_kb:.1f} KB) at {pdf_path}")
else:
    print(f"ERROR: PDF not found. Stderr: {res.stderr}")
    sys.exit(1)
