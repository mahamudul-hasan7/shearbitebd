# -*- coding: utf-8 -*-
"""
ShareBite BD - Clean, Academic, Modern Presentation (HTML & PDF)
Follows user's reference layout:
- Crisp white/light academic styling
- Numbered modules (01, 02, 03)
- Clear slide headers with category pills
- 16:9 widescreen layout
- Pure, clean, understandable diagrams and typography (no weird AI art)
"""

import os
import subprocess

base_dir = os.getcwd().replace("\\", "/")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ShareBite BD — SE Lab Project Proposal</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    @page {{
      size: 16in 9in;
      margin: 0;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #f1f5f9;
      color: #0f172a;
      line-height: 1.45;
    }}

    .deck {{
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
      padding: 30px 0;
    }}

    .slide {{
      width: 16in;
      height: 9in;
      min-height: 9in;
      max-height: 9in;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      position: relative;
      background: #ffffff;
      padding: 42px 55px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }}

    /* Slide Header */
    .slide-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1.5px solid #e2e8f0;
    }}

    .header-category {{
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 9999px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #059669;
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    .header-category::before {{
      content: '';
      width: 6px;
      height: 6px;
      background: #059669;
      border-radius: 50%;
    }}

    .brand-meta {{
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.3px;
    }}

    /* Slide Body */
    .slide-body {{
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 16px 0;
    }}

    .title-block {{
      margin-bottom: 18px;
    }}

    .slide-title {{
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.6px;
      color: #0f172a;
      line-height: 1.15;
    }}

    .slide-subtitle {{
      font-size: 15.5px;
      font-weight: 500;
      color: #64748b;
      margin-top: 4px;
    }}

    /* Cards */
    .card {{
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px 22px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
      position: relative;
    }}

    .card-num {{
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 4px;
    }}

    .card-title {{
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }}

    .card-desc {{
      font-size: 13.5px;
      color: #334155;
      line-height: 1.5;
    }}

    /* KPI Stat Boxes */
    .stat-box {{
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 20px;
      text-align: center;
    }}

    .stat-num {{
      font-size: 34px;
      font-weight: 900;
      line-height: 1;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }}

    .stat-label {{
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }}

    .stat-sub {{
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }}

    /* Slide Footer */
    .slide-footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1.5px solid #e2e8f0;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }}

    .footer-pill {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 3px 10px;
      border-radius: 6px;
      font-weight: 700;
      color: #475569;
    }}

    @media print {{
      body {{ background: transparent; }}
      .deck {{ padding: 0; gap: 0; }}
      .slide {{ box-shadow: none; border: none; }}
    }}
  </style>
</head>
<body>

  <div class="deck">

    <!-- ========================================== -->
    <!-- SLIDE 1: TITLE SLIDE (CLEAN ACADEMIC) -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="header-category">CSE LAB &bull; 10-MINUTE PROJECT PROPOSAL</div>
        <div class="brand-meta">Department of Computer Science & Engineering (CSE) &bull; UIU</div>
      </div>

      <div class="slide-body">
        <div style="margin-bottom: 24px;">
          <h1 style="font-size: 52px; font-weight: 900; color: #064e3b; letter-spacing: -1px; margin-bottom: 6px;">
            ShareBite <span style="color: #059669;">BD</span>
          </h1>
          <p style="font-size: 22px; font-weight: 700; color: #334155;">
            Hyper-Local Surplus Food Rescue & Safety-Compliant Redistribution Network
          </p>
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 24px;">
          <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 700;">🎯 UN SDG 2: Zero Hunger</span>
          <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 700;">🌱 UN SDG 12: Responsible Consumption</span>
          <span style="background: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 700;">⚡ 15–30 Min Rescue Velocity</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <div class="card" style="border-top: 4px solid #059669;">
            <div class="card-num" style="color: #059669;">01</div>
            <div class="card-title">TARGET ECOSYSTEM</div>
            <p class="card-desc">
              <strong>Focused Campus Pilot:</strong><br>
              &bull; UIU Central Cafeteria<br>
              &bull; Dhanmondi & Badda Local Caterers<br>
              &bull; Nearby Orphanages & Day Shelters
            </p>
          </div>

          <div class="card" style="border-top: 4px solid #0284c7;">
            <div class="card-num" style="color: #0284c7;">02</div>
            <div class="card-title">CORE SOFTWARE GOAL</div>
            <p class="card-desc">
              <strong>Eliminate Cooked Food Dumping:</strong><br>
              &bull; Sub-60s rapid listing module<br>
              &bull; 3–5 km proximity radar GIS filter<br>
              &bull; 4-Digit OTP handshake delivery verification
            </p>
          </div>

          <div class="card" style="border-top: 4px solid #7c3aed;">
            <div class="card-num" style="color: #7c3aed;">03</div>
            <div class="card-title">ACADEMIC SCOPE</div>
            <p class="card-desc">
              <strong>16-Week Implementation:</strong><br>
              &bull; Next.js 16 SSR & Prisma ORM<br>
              &bull; PostgreSQL ACID claim state engine<br>
              &bull; Leaflet.js GIS without paid API billing
            </p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Software Engineering Lab &bull; Project Proposal Deck</div>
        <div class="footer-pill">Slide 1 / 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 2: PROBLEM IDENTIFICATION -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="header-category">PROBLEM STATEMENT</div>
        <div class="brand-meta">Section 1: Problem Identification &bull; ShareBite BD</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">1. Problem Identification: What Problem Are We Solving?</h2>
          <p class="slide-subtitle">The critical paradox of urban food waste vs. street hunger in Dhaka City</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.6fr; gap: 24px; margin-bottom: 18px;">
          <!-- Left: Diagnosis Card -->
          <div class="card" style="border-left: 4px solid #059669; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase;">CORE DIAGNOSIS</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 4px 0 10px 0;">Why Does Good Food Go to Waste?</div>
              <p style="font-size: 13.5px; color: #334155; line-height: 1.55;">
                In Dhaka, food waste is <strong>NOT</strong> caused by food shortage.<br><br>
                It is fundamentally an <strong>INFORMATION, COORDINATION, and MICRO-LOGISTICS failure</strong>.<br><br>
                Institutional kitchens cook in bulk. When trays remain at night, donors have zero rapid, verified channels to reach hungry communities within the critical biological safety window.
              </p>
            </div>
          </div>

          <!-- Right: 3 Numbered Problem Drivers -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="card" style="border-left: 4px solid #e11d48; padding: 14px 18px;">
              <div style="font-size: 14.5px; font-weight: 800; color: #0f172a;">
                <span style="color: #e11d48; font-weight: 900;">01</span> THE DAILY MIDNIGHT FOOD DUMP
              </div>
              <p style="font-size: 12.5px; color: #475569; margin-top: 3px;">
                University cafeterias (e.g. UIU Central Cafeteria), event caterers, and eateries discard 40–80 kg of untouched hot meals every night into municipal dumpsters due to zero instant charity links.
              </p>
            </div>

            <div class="card" style="border-left: 4px solid #d97706; padding: 14px 18px;">
              <div style="font-size: 14.5px; font-weight: 800; color: #0f172a;">
                <span style="color: #d97706; font-weight: 900;">02</span> THE 4-HOUR BIOLOGICAL SAFETY CLOCK
              </div>
              <p style="font-size: 12.5px; color: #475569; margin-top: 3px;">
                Cooked food enters the bacterial danger zone (5°C–60°C). Under Bangladesh Food Safety Authority (BFSA) guidelines, cooked meals must be eaten within 4 hours. Manual coordination takes 5+ hours.
              </p>
            </div>

            <div class="card" style="border-left: 4px solid #0284c7; padding: 14px 18px;">
              <div style="font-size: 14.5px; font-weight: 800; color: #0f172a;">
                <span style="color: #0284c7; font-weight: 900;">03</span> THE MISSING MICRO-LOGISTICS LINK
              </div>
              <p style="font-size: 12.5px; color: #475569; margin-top: 3px;">
                Nearby orphanages and shelters lack vehicles or night staff. Food is available just 2 km away, but there is zero automated courier dispatch system to transport it in time.
              </p>
            </div>
          </div>
        </div>

        <!-- Bottom Takeaway -->
        <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 10px; padding: 10px 18px; text-align: center; font-size: 13px; font-weight: 700; color: #064e3b;">
          💡 KEY TAKEAWAY: Food surplus and severe hunger exist within 3 km of each other, but lack an automated software platform to bridge the 4-hour safety window.
        </div>
      </div>

      <div class="slide-footer">
        <div>Problem Context: Information asymmetry and micro-transport bottleneck</div>
        <div class="footer-pill">Slide 2 / 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 3: EVIDENCE & DATA -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="header-category">EVIDENCE & REAL-WORLD IMPACT</div>
        <div class="brand-meta">Section 1: Evidence & Data &bull; ShareBite BD</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">1. Evidence & Data: Backed by Hard Statistics</h2>
          <p class="slide-subtitle">Authoritative research on food waste, biological danger limits, and urban food insecurity</p>
        </div>

        <!-- 4 Big Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 22px;">
          <div class="stat-box" style="border-top: 4px solid #e11d48;">
            <div class="stat-num" style="color: #e11d48;">10.7M Tons</div>
            <div class="stat-label">Annual Food Waste</div>
            <div class="stat-sub">UNEP Food Waste Index 2024 (BD)</div>
          </div>

          <div class="stat-box" style="border-top: 4px solid #d97706;">
            <div class="stat-num" style="color: #d97706;">4 Hours</div>
            <div class="stat-label">Biological Safety Limit</div>
            <div class="stat-sub">BFSA Danger Zone (5°C – 60°C)</div>
          </div>

          <div class="stat-box" style="border-top: 4px solid #0284c7;">
            <div class="stat-num" style="color: #0284c7;">3.8 Million</div>
            <div class="stat-label">Urban Food-Insecure</div>
            <div class="stat-sub">BBS & World Bank Slum Report</div>
          </div>

          <div class="stat-box" style="border-top: 4px solid #059669;">
            <div class="stat-num" style="color: #059669;">0% Digital</div>
            <div class="stat-label">Campus Traceability Today</div>
            <div class="stat-sub">Zero Audit Trail or Safety Records</div>
          </div>
        </div>

        <!-- Bottom: 3 Core Real-World Impact Takeaway Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <div class="card" style="border-top: 4px solid #059669;">
            <div class="card-num" style="color: #059669;">01</div>
            <div class="card-title">SOCIAL IMPACT: ZERO HUNGER (SDG 2)</div>
            <p class="card-desc">
              Directly feeds destitute children, orphanages, and street laborers with preserved human dignity. Rescuing a single 40 kg batch feeds <strong>80–100 hungry people</strong> every night.
            </p>
          </div>

          <div class="card" style="border-top: 4px solid #0284c7;">
            <div class="card-num" style="color: #0284c7;">02</div>
            <div class="card-title">HEALTH & SAFETY: BFSA COMPLIANCE</div>
            <p class="card-desc">
              Enforces mandatory digital timestamping and temperature monitoring. Food exceeding the 4-hour threshold is automatically locked out, completely eliminating food poisoning risks.
            </p>
          </div>

          <div class="card" style="border-top: 4px solid #7c3aed;">
            <div class="card-num" style="color: #7c3aed;">03</div>
            <div class="card-title">ENVIRONMENT: METHANE PREVENTION (SDG 12)</div>
            <p class="card-desc">
              Diverts tons of decomposing organic food from open city landfills in Aminbazar and Matuail, slashing lethal greenhouse gas emissions and urban environmental decay.
            </p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Data Sources: UNEP Food Waste Index 2024, Bangladesh Food Safety Authority (BFSA), BBS Urban Survey</div>
        <div class="footer-pill">Slide 3 / 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 4: SOLUTION (THE CORE IDEA & ECOSYSTEM) -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="header-category">SOLUTION ARCHITECTURE</div>
        <div class="brand-meta">Section 2: Solution &bull; ShareBite BD</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">2. Solution: The Core Idea & 3-Sided Ecosystem</h2>
          <p class="slide-subtitle">A synchronized hyper-local network engineered for 15–30 minute rescue turnaround</p>
        </div>

        <!-- Mandatory One-Liner Box -->
        <div style="background: #ecfdf5; border: 2px solid #059669; border-radius: 12px; padding: 18px 24px; margin-bottom: 22px;">
          <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
            🌟 ONE SINGLE LINE (Explaining the project to a kid or parent):
          </div>
          <div style="font-size: 20px; font-weight: 800; color: #064e3b; line-height: 1.35;">
            "An Uber-like platform where university cafeterias post extra hot food, and student volunteers bike it to nearby orphanages in 30 minutes before it spoils!"
          </div>
        </div>

        <!-- 3-Sided Pillar Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <div class="card" style="border-top: 4px solid #059669;">
            <div class="card-num" style="color: #059669;">01</div>
            <div class="card-title">FOOD DONORS</div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 8px;">Cafeterias, Caterers & Restaurants</div>
            <p class="card-desc">
              &bull; <strong>60-Second Posting:</strong> Quick 3-field listing form.<br>
              &bull; <strong>AI Spoilage Gauge:</strong> Visual countdown dial.<br>
              &bull; <strong>Meal Converter:</strong> '40 kg Biryani = 80 meals'.
            </p>
          </div>

          <div class="card" style="border-top: 4px solid #0284c7;">
            <div class="card-num" style="color: #0284c7;">02</div>
            <div class="card-title">VERIFIED NGOS</div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 8px;">Orphanages & Local Shelters</div>
            <p class="card-desc">
              &bull; <strong>Proximity Radar Map:</strong> Filtered to 3–5 km.<br>
              &bull; <strong>1-Click Claim Engine:</strong> Instant reservation.<br>
              &bull; <strong>Digital CSR Receipts:</strong> Automated audit reports.
            </p>
          </div>

          <div class="card" style="border-top: 4px solid #d97706;">
            <div class="card-num" style="color: #d97706;">03</div>
            <div class="card-title">STUDENT VOLUNTEERS</div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 8px;">Campus Cyclists & Bikers Squad</div>
            <p class="card-desc">
              &bull; <strong>Uber-Style Push Alerts:</strong> Notified during commutes.<br>
              &bull; <strong>15–30 Min Velocity:</strong> Rapid drop-off.<br>
              &bull; <strong>Thermal Bag Check:</strong> Insulated food safety.
            </p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Ecosystem Flow: Donor Posts &rarr; NGO Claims &rarr; Volunteer Delivers &rarr; Handover Verified</div>
        <div class="footer-pill">Slide 4 / 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 5: MAIN FEATURES & OUTPUTS -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="header-category">CORE FUNCTIONALITIES</div>
        <div class="brand-meta">Section 2: Key Features &bull; ShareBite BD</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">2. Main Features: What Will the End System Perform?</h2>
          <p class="slide-subtitle">Four engineered modules eliminating the primary failure points in food rescue</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-bottom: 18px;">
          <div class="card" style="border-left: 4px solid #059669;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              <span style="color: #059669; font-weight: 900;">01</span> AI SPOILAGE METER & TIMEOUT LOCK
            </div>
            <p class="card-desc">
              <strong>Input:</strong> Cooking timestamp & storage type.<br>
              <strong>Mechanism:</strong> Dynamic biological decay countdown enforcing the BFSA 4-hour window.<br>
              <strong>Output:</strong> Real-time visual dial; automatically de-lists batches when time runs out to ensure 100% food safety.
            </p>
          </div>

          <div class="card" style="border-left: 4px solid #0284c7;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              <span style="color: #0284c7; font-weight: 900;">02</span> 3–5 KM HYPER-LOCAL RADAR MAP
            </div>
            <p class="card-desc">
              <strong>Input:</strong> GPS coordinates of donors and recipient shelters.<br>
              <strong>Mechanism:</strong> Client-side Haversine circular radius queries on OpenStreetMap.<br>
              <strong>Output:</strong> Eliminates Dhaka traffic gridlock by strictly matching donations within a 15-minute cycling/walking radius.
            </p>
          </div>

          <div class="card" style="border-left: 4px solid #d97706;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              <span style="color: #d97706; font-weight: 900;">03</span> UBER-STYLE VOLUNTEER DISPATCH
            </div>
            <p class="card-desc">
              <strong>Input:</strong> Active verified claims & volunteer locations.<br>
              <strong>Mechanism:</strong> Instant broadcast push alerts to registered student cyclists/bikers.<br>
              <strong>Output:</strong> Provides turn-by-turn route directions, donor contact, pickup deadline, and thermal bag checklist.
            </p>
          </div>

          <div class="card" style="border-left: 4px solid #7c3aed;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              <span style="color: #7c3aed; font-weight: 900;">04</span> 4-DIGIT OTP & QR ANTI-FRAUD PROTOCOL
            </div>
            <p class="card-desc">
              <strong>Input:</strong> Donor secret PIN & NGO receipt token.<br>
              <strong>Mechanism:</strong> Dual-layer cryptographic handshake at pickup and drop-off.<br>
              <strong>Output:</strong> Eliminates food diversion or black-market resale; guarantees food reaches intended children with 100% audit trail.
            </p>
          </div>
        </div>

        <!-- Process Flow Strip -->
        <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 10px; padding: 10px 18px; text-align: center; font-size: 12.5px; font-weight: 700; color: #0369a1;">
          WORKFLOW: 60s Post ➔ AI Spoilage Verification ➔ 3km Radar Alert ➔ Student Biker Dispatch ➔ OTP Handshake Handover
        </div>
      </div>

      <div class="slide-footer">
        <div>Key Outputs: Sub-30 minute delivery velocity & complete digital traceability</div>
        <div class="footer-pill">Slide 5 / 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 6: PLAN OF ACTION (TECH OVERVIEW) -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="header-category">TECHNOLOGY & ARCHITECTURE</div>
        <div class="brand-meta">Section 3: Plan of Action &bull; ShareBite BD</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">3. Plan of Action: High-Level Technology Overview</h2>
          <p class="slide-subtitle">Modern open-source stack chosen for rapid response time, relational integrity, and zero operating costs</p>
        </div>

        <!-- Architecture Flow Pipeline Box -->
        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 20px; margin-bottom: 20px;">
          <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; margin-bottom: 8px;">
            🏗️ SYSTEM ARCHITECTURE & DATA FLOW PIPELINE
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; color: #0f172a;">
            <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; text-align: center;">01 DONOR WEB<br><span style="font-size: 10px; color: #059669;">Next.js 16 SSR</span></div>
            <div style="color: #64748b; font-size: 16px;">➔</div>
            <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; text-align: center;">02 API LOGIC<br><span style="font-size: 10px; color: #0284c7;">TypeScript / Zod</span></div>
            <div style="color: #64748b; font-size: 16px;">➔</div>
            <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; text-align: center;">03 DATABASE<br><span style="font-size: 10px; color: #7c3aed;">Prisma + PostgreSQL</span></div>
            <div style="color: #64748b; font-size: 16px;">➔</div>
            <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; text-align: center;">04 RADAR GIS<br><span style="font-size: 10px; color: #d97706;">Leaflet + OSM</span></div>
            <div style="color: #64748b; font-size: 16px;">➔</div>
            <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; text-align: center;">05 VOLUNTEER PWA<br><span style="font-size: 10px; color: #059669;">WebSockets & FCM</span></div>
            <div style="color: #64748b; font-size: 16px;">➔</div>
            <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; text-align: center;">06 OTP HANDOVER<br><span style="font-size: 10px; color: #e11d48;">Tamper-Proof PIN</span></div>
          </div>
        </div>

        <!-- 3 Tech Cards (With Clear Rationale) -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <div class="card" style="border-top: 4px solid #059669;">
            <div class="card-num" style="color: #059669;">01</div>
            <div class="card-title">FRONTEND & MOBILE PWA</div>
            <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 8px;">Next.js 16 + React 19 + Tailwind CSS</div>
            <p class="card-desc">
              <strong>Role:</strong> Unified web portal & mobile PWA for all 3 user roles.<br><br>
              <strong>Why Chosen:</strong><br>
              &bull; Sub-100ms cold start times over 4G cellular data<br>
              &bull; Progressive Web App (PWA) eliminates app-store install barrier<br>
              &bull; Tailwind CSS v4 provides lightweight, responsive UI
            </p>
          </div>

          <div class="card" style="border-top: 4px solid #0284c7;">
            <div class="card-num" style="color: #0284c7;">02</div>
            <div class="card-title">BACKEND & DATA LAYER</div>
            <div style="font-size: 12px; font-weight: 700; color: #0284c7; margin-bottom: 8px;">Prisma ORM + PostgreSQL + TypeScript</div>
            <p class="card-desc">
              <strong>Role:</strong> Data persistence, auth & claim state machine.<br><br>
              <strong>Why Chosen:</strong><br>
              &bull; ACID transactions prevent race conditions (no double-claims)<br>
              &bull; End-to-end type safety eliminates runtime schema errors<br>
              &bull; Relational integrity links Donors, NGOs, and Couriers
            </p>
          </div>

          <div class="card" style="border-top: 4px solid #d97706;">
            <div class="card-num" style="color: #d97706;">03</div>
            <div class="card-title">GEOSPATIAL ENGINE</div>
            <div style="font-size: 12px; font-weight: 700; color: #d97706; margin-bottom: 8px;">Leaflet.js + OpenStreetMap (OSM)</div>
            <p class="card-desc">
              <strong>Role:</strong> Interactive radar map, circular radius query & distance.<br><br>
              <strong>Why Chosen:</strong><br>
              &bull; 100% open-source without Google Maps billing/credit card limits<br>
              &bull; Fast client-side Haversine circular radius queries<br>
              &bull; Low memory footprint runs smoothly on student smartphones
            </p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Architecture Justification: Zero cloud fees, complete type-safety, and instant mobile response</div>
        <div class="footer-pill">Slide 6 / 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 7: TIMELINE & ROADMAP -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="header-category">SEMESTER MILESTONES & DEFENSE</div>
        <div class="brand-meta">Section 4: Timeline &bull; ShareBite BD</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">4. Project Timeline: 16-Week Implementation Roadmap</h2>
          <p class="slide-subtitle">Structured semester progression from system architecture to live UIU campus field pilot and defense</p>
        </div>

        <!-- 4 Sprints (01, 02, 03, 04) -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;">
          <div class="card" style="border-top: 4px solid #059669;">
            <div class="card-num" style="color: #059669;">01</div>
            <div class="card-title" style="font-size: 14px;">PHASE 1: ARCHITECTURE</div>
            <div style="font-size: 11px; font-weight: 800; color: #059669; margin-bottom: 6px;">WEEKS 1 – 4</div>
            <p class="card-desc" style="font-size: 12px; line-height: 1.55;">
              &bull; System Requirements (SRS)<br>
              &bull; Prisma relational schema models<br>
              &bull; 3-Portal responsive UI setup<br>
              &bull; Role-based authentication
            </p>
            <div style="margin-top: 8px; font-size: 10.5px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 3px 6px; border-radius: 6px; width: fit-content;">
              Status: 100% Completed
            </div>
          </div>

          <div class="card" style="border-top: 4px solid #0284c7;">
            <div class="card-num" style="color: #0284c7;">02</div>
            <div class="card-title" style="font-size: 14px;">PHASE 2: CORE LOGIC</div>
            <div style="font-size: 11px; font-weight: 800; color: #0284c7; margin-bottom: 6px;">WEEKS 5 – 8</div>
            <p class="card-desc" style="font-size: 12px; line-height: 1.55;">
              &bull; 60s listing form & meal calculator<br>
              &bull; AI Spoilage dynamic countdown<br>
              &bull; Leaflet geospatial radar (3km)<br>
              &bull; 4-Digit OTP & QR handshake
            </p>
            <div style="margin-top: 8px; font-size: 10.5px; font-weight: 700; color: #0284c7; background: #f0f9ff; padding: 3px 6px; border-radius: 6px; width: fit-content;">
              Status: 90% Completed
            </div>
          </div>

          <div class="card" style="border-top: 4px solid #d97706;">
            <div class="card-num" style="color: #d97706;">03</div>
            <div class="card-title" style="font-size: 14px;">PHASE 3: CAMPUS PILOT</div>
            <div style="font-size: 11px; font-weight: 800; color: #d97706; margin-bottom: 6px;">WEEKS 9 – 12</div>
            <p class="card-desc" style="font-size: 12px; line-height: 1.55;">
              &bull; UIU Cafeteria live trial run<br>
              &bull; Student cyclist squad onboarding<br>
              &bull; Satarkul orphanage delivery test<br>
              &bull; Turnaround latency tuning
            </p>
            <div style="margin-top: 8px; font-size: 10.5px; font-weight: 700; color: #d97706; background: #fffbeb; padding: 3px 6px; border-radius: 6px; width: fit-content;">
              Target: Live Field Run
            </div>
          </div>

          <div class="card" style="border-top: 4px solid #7c3aed;">
            <div class="card-num" style="color: #7c3aed;">04</div>
            <div class="card-title" style="font-size: 14px;">PHASE 4: AUDIT & DEFENSE</div>
            <div style="font-size: 11px; font-weight: 800; color: #7c3aed; margin-bottom: 6px;">WEEKS 13 – 16</div>
            <p class="card-desc" style="font-size: 12px; line-height: 1.55;">
              &bull; Concurrency & stress testing<br>
              &bull; Anti-fraud security penetration test<br>
              &bull; Project impact analytics report<br>
              &bull; Final SE Lab defense presentation
            </p>
            <div style="margin-top: 8px; font-size: 10.5px; font-weight: 700; color: #7c3aed; background: #faf5ff; padding: 3px 6px; border-radius: 6px; width: fit-content;">
              Target: Final Defense
            </div>
          </div>
        </div>

        <!-- Bottom Summary & Q&A Strip -->
        <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 15px; font-weight: 800; color: #064e3b;">
              🚀 Ready to Transform Campus Surplus into Immediate Hunger Relief
            </div>
            <div style="font-size: 12.5px; color: #047857; margin-top: 2px;">
              Zero commercial barrier &bull; Real community impact at UIU &bull; Rigorous Software Engineering execution
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 13.5px; font-weight: 800; color: #059669;">Q & A SESSION</div>
            <div style="font-size: 11.5px; color: #475569;">Open for Evaluation, Faculty Guidance & Feedback</div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Software Engineering Lab Proposal &bull; 10-Minute Presentation Deck</div>
        <div class="footer-pill">Slide 7 / 7 &bull; End of Deck</div>
      </div>
    </section>

  </div>

</body>
</html>
"""

html_path = os.path.join(base_dir, "ShareBite_BD_SE_Lab_Presentation.html")
with open(html_path, "wb") as f:
    f.write(html_content.encode("utf-8"))

print(f"Clean Academic HTML generated ({len(html_content)} bytes)")

pdf_path = os.path.join(base_dir, "ShareBite_BD_SE_Lab_Presentation.pdf")
chrome_cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]

res = subprocess.run(chrome_cmd, capture_output=True, text=True)
if os.path.exists(pdf_path):
    print(f"SUCCESS: Clean Academic PDF generated ({os.path.getsize(pdf_path)/1024:.1f} KB) at: {pdf_path}")
else:
    print(f"Error compiling PDF: {res.stderr}")
