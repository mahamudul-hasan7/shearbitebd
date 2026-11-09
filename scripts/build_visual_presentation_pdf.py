# -*- coding: utf-8 -*-
"""
ShareBite BD - Ultra-Professional Executive Dark Presentation
Features:
- Brand-new generated high-res photos
- Dark obsidian executive aesthetic (Apple/Linear keynote style)
- Big bold KPI stat counters
- Minimal punchy key points (zero walls of text)
- 16:9 widescreen layout
"""

import os
import subprocess

base_dir = os.getcwd().replace("\\", "/")

img_waste = f"file:///{base_dir}/public/images/slides/slide2_cafeteria_waste.jpg"
img_child = f"file:///{base_dir}/public/images/slides/slide3_child_hunger.jpg"
img_volunteer = f"file:///{base_dir}/public/images/slides/slide5_volunteer_cyclist.jpg"

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
      background-color: #030712;
      color: #f8fafc;
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
      background: radial-gradient(circle at 15% 15%, #0f1d36 0%, #080d1a 60%, #030712 100%);
      padding: 42px 55px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }}

    /* Slide Header */
    .slide-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }}

    .brand-group {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}

    .brand-logo {{
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 16px;
      color: #ffffff;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
    }}

    .brand-name {{
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #ffffff;
    }}

    .brand-name span {{
      color: #34d399;
    }}

    .section-pill {{
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(52, 211, 153, 0.35);
      color: #6ee7b7;
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    .section-pill::before {{
      content: '';
      width: 7px;
      height: 7px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
    }}

    /* Slide Content Container */
    .slide-body {{
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 16px 0;
    }}

    .title-block {{
      margin-bottom: 22px;
    }}

    .slide-title {{
      font-size: 34px;
      font-weight: 900;
      letter-spacing: -0.8px;
      color: #ffffff;
      line-height: 1.15;
      display: flex;
      align-items: center;
      gap: 12px;
    }}

    .slide-subtitle {{
      font-size: 16px;
      font-weight: 500;
      color: #94a3b8;
      margin-top: 6px;
      letter-spacing: -0.2px;
    }}

    /* Slide Footer */
    .slide-footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
    }}

    .slide-footer .badge {{
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.04);
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }}

    /* Modern Card Styles */
    .glass-card {{
      background: rgba(17, 24, 39, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 22px 24px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }}

    .glass-card-glow {{
      border: 1px solid rgba(52, 211, 153, 0.3);
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.15);
    }}

    .card-title {{
      font-size: 18px;
      font-weight: 800;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }}

    .card-desc {{
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.5;
    }}

    .card-desc strong {{
      color: #e2e8f0;
    }}

    /* Image Container */
    .img-frame {{
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
      height: 100%;
    }}

    .img-frame img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}

    .img-overlay-tag {{
      position: absolute;
      bottom: 14px;
      left: 14px;
      background: rgba(3, 7, 18, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    /* Stat Box */
    .stat-kpi {{
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 18px 20px;
      text-align: center;
      position: relative;
    }}

    .stat-kpi .num {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 38px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -1px;
      margin-bottom: 6px;
    }}

    .stat-kpi .label {{
      font-size: 13px;
      font-weight: 700;
      color: #e2e8f0;
      margin-bottom: 3px;
    }}

    .stat-kpi .sub {{
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }}

    @media print {{
      body {{ background: transparent; }}
      .deck {{ padding: 0; gap: 0; }}
      .slide {{ box-shadow: none; }}
    }}
  </style>
</head>
<body>

  <div class="deck">

    <!-- ========================================== -->
    <!-- SLIDE 1: TITLE (HERO KEYNOTE) -->
    <!-- ========================================== -->
    <section class="slide" style="background: radial-gradient(circle at 75% 20%, #064e3b 0%, #0a241e 40%, #030712 100%);">
      <div class="slide-header" style="border-bottom: none;">
        <div class="brand-group">
          <div class="brand-logo">SB</div>
          <div class="brand-name">ShareBite <span>BD</span></div>
        </div>
        <div class="section-pill" style="background: rgba(52, 211, 153, 0.15); border-color: #34d399;">
          SE LAB PROJECT PROPOSAL &bull; 10-MIN PRESENTATION
        </div>
      </div>

      <div class="slide-body" style="justify-content: center; max-width: 1200px;">
        <div style="display: flex; gap: 10px; margin-bottom: 16px;">
          <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(52, 211, 153, 0.4); color: #6ee7b7; padding: 5px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">🎯 UN SDG 2 (Zero Hunger)</span>
          <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(52, 211, 153, 0.4); color: #6ee7b7; padding: 5px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">🌱 UN SDG 12 (Responsible Consumption)</span>
          <span style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; padding: 5px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700;">⚡ 15–30 Min Rescue Velocity</span>
        </div>

        <h1 style="font-size: 58px; font-weight: 900; line-height: 1.05; letter-spacing: -1.5px; color: #ffffff; margin-bottom: 14px;">
          ShareBite <span style="background: linear-gradient(135deg, #34d399 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">BD</span>
        </h1>
        <p style="font-size: 24px; font-weight: 600; color: #cbd5e1; max-width: 1050px; line-height: 1.35; margin-bottom: 30px;">
          A Hyper-Local, Crowd-Sourced Food Rescue & Safety-Compliant Redistribution Platform for Dhaka City
        </p>

        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px;">
          <div class="glass-card" style="border-left: 4px solid #10b981; padding: 18px 22px;">
            <div style="font-size: 12px; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.5px;">Target Pilot Ecosystem</div>
            <div style="font-size: 15px; font-weight: 700; color: #f8fafc; margin-top: 4px;">United International University (UIU) Central Cafeteria, Local Caterers & Satarkul/Badda Shelters</div>
          </div>
          <div class="glass-card" style="border-left: 4px solid #38bdf8; padding: 18px 22px;">
            <div style="font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">Core Software Engineering Goal</div>
            <div style="font-size: 15px; font-weight: 700; color: #f8fafc; margin-top: 4px;">Eliminate cooked food dumping via sub-60s listing, proximity radar GIS, and zero-trust OTP handovers.</div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Department of Computer Science & Engineering (CSE) &bull; Software Engineering Lab</div>
        <div class="badge">Team Presentation Deck &bull; Slide 1 of 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 2: PROBLEM IDENTIFICATION -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand-group">
          <div class="brand-logo">SB</div>
          <div class="brand-name">ShareBite <span>BD</span></div>
        </div>
        <div class="section-pill">Section 1: Problem Identification</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">1. Problem Identification: What Problem Are We Solving?</h2>
          <p class="slide-subtitle">Dhaka's critical paradox: Mountains of fresh cooked food discarded nightly while street children sleep hungry</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.15fr; gap: 30px; height: 470px;">
          <!-- Left: New High-Res Photo -->
          <div class="img-frame">
            <img src="{img_waste}" alt="Dhaka Cafeteria Food Waste">
            <div class="img-overlay-tag">
              📸 Commercial Kitchen / UIU Cafeteria &bull; 40–80 kg Daily Surplus Discarded
            </div>
          </div>

          <!-- Right: 3 Punchy Problem Cards -->
          <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
            <div class="glass-card" style="border-left: 4px solid #f43f5e; background: rgba(30, 20, 30, 0.6);">
              <div class="card-title" style="color: #fb7185;">
                <span>🗑️</span> 1. The Daily Midnight Dump
              </div>
              <p class="card-desc">
                University cafeterias (e.g. UIU), event halls, and restaurants cook in bulk. Every night, huge pots of hygienic, edible food are thrown straight into dumpsters simply because donors lack an instant charity contact.
              </p>
            </div>

            <div class="glass-card" style="border-left: 4px solid #f59e0b; background: rgba(35, 28, 15, 0.6);">
              <div class="card-title" style="color: #fbbf24;">
                <span>⏱️</span> 2. The 4-Hour Biological Clock
              </div>
              <p class="card-desc">
                Cooked food enters the bacterial danger zone (5°C–60°C). Under <strong>BFSA safety guidelines</strong>, food must be consumed within 4 hours. Manual phone calls and bureaucratic arrangements take 6+ hours—resulting in total spoilage.
              </p>
            </div>

            <div class="glass-card" style="border-left: 4px solid #38bdf8; background: rgba(15, 28, 40, 0.6);">
              <div class="card-title" style="color: #38bdf8;">
                <span>🚫</span> 3. The Missing Micro-Logistics Link
              </div>
              <p class="card-desc">
                Local orphanages and shelters have zero transport vehicles or fuel budgets at 10 PM. While 100 children starve only 2 km away, there is no automated micro-logistics platform to dispatch student couriers to bridge the gap.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Root Cause: Communication failure & lack of automated hyper-local dispatch, NOT food shortage.</div>
        <div class="badge">Slide 2 of 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 3: EVIDENCE & DATA -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand-group">
          <div class="brand-logo">SB</div>
          <div class="brand-name">ShareBite <span>BD</span></div>
        </div>
        <div class="section-pill">Section 1: Evidence & Real-World Impact</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">1. Evidence & Data: Backed by Hard Statistics</h2>
          <p class="slide-subtitle">Quantifying the urban food crisis, biological decay limits, and social urgency in Dhaka</p>
        </div>

        <!-- 4 Big KPI Metric Boxes -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px;">
          <div class="stat-kpi" style="border-top: 4px solid #f43f5e;">
            <div class="num" style="color: #f43f5e;">10.7M Tons</div>
            <div class="label">Annual Food Waste</div>
            <div class="sub">UNEP Food Waste Index 2024 (BD)</div>
          </div>
          <div class="stat-kpi" style="border-top: 4px solid #f59e0b;">
            <div class="num" style="color: #f59e0b;">4 Hours</div>
            <div class="label">Biological Safety Limit</div>
            <div class="sub">BFSA Danger Zone (5°C – 60°C)</div>
          </div>
          <div class="stat-kpi" style="border-top: 4px solid #38bdf8;">
            <div class="num" style="color: #38bdf8;">3.8 Million</div>
            <div class="label">Urban Food-Insecure</div>
            <div class="sub">BBS & World Bank Slum Report</div>
          </div>
          <div class="stat-kpi" style="border-top: 4px solid #10b981;">
            <div class="num" style="color: #10b981;">0% Digital</div>
            <div class="label">Current Traceability</div>
            <div class="sub">Zero Audit Trail or OTP Safety</div>
          </div>
        </div>

        <!-- Split: Poignant Photo + Impact Points -->
        <div style="display: grid; grid-template-columns: 1fr 1.35fr; gap: 30px; height: 260px;">
          <div class="img-frame">
            <img src="{img_child}" alt="Hunger in Dhaka">
            <div class="img-overlay-tag">
              📸 The Reality: Millions of children in Dhaka lack access to a single hot meal daily
            </div>
          </div>

          <div class="glass-card glass-card-glow" style="display: flex; flex-direction: column; justify-content: space-between; padding: 22px 28px;">
            <div style="font-size: 16px; font-weight: 800; color: #34d399; margin-bottom: 8px;">
              🌍 Real-World Impact Pillars (Why This System Matters):
            </div>
            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span style="font-size: 20px;">🍲</span>
              <div>
                <strong style="color: #f1f5f9; font-size: 14.5px;">Dignified Hunger Relief (SDG 2):</strong>
                <p style="font-size: 13.5px; color: #94a3b8;">Transforms cafeteria surplus into 80–120 fresh hot meals daily for orphanages and street children with zero humiliation.</p>
              </div>
            </div>
            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span style="font-size: 20px;">🛡️</span>
              <div>
                <strong style="color: #f1f5f9; font-size: 14.5px;">Food Safety & Legal Immunity:</strong>
                <p style="font-size: 13.5px; color: #94a3b8;">Strict BFSA thermal tracking protects donors and recipients; bad food is automatically rejected before pickup.</p>
              </div>
            </div>
            <div style="display: flex; gap: 14px; align-items: flex-start;">
              <span style="font-size: 20px;">🌱</span>
              <div>
                <strong style="color: #f1f5f9; font-size: 14.5px;">Climate Action & Methane Prevention (SDG 12):</strong>
                <p style="font-size: 13.5px; color: #94a3b8;">Prevents tons of rotting organic waste in Dhaka city dumpsters, slashing lethal urban methane emissions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Data Sources: UNEP Food Waste Index 2024, Bangladesh Food Safety Authority (BFSA), BBS Urban Slum Survey</div>
        <div class="badge">Slide 3 of 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 4: SOLUTION (THE CORE IDEA) -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand-group">
          <div class="brand-logo">SB</div>
          <div class="brand-name">ShareBite <span>BD</span></div>
        </div>
        <div class="section-pill">Section 2: The Solution Approach</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">2. Solution: The Core Idea & System Model</h2>
          <p class="slide-subtitle">A synchronized 3-sided micro-logistics platform engineered for 15–30 minute rescue velocity</p>
        </div>

        <!-- Mandatory Guideline One-Liner Hero Box -->
        <div class="glass-card glass-card-glow" style="background: linear-gradient(135deg, rgba(6, 78, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%); border: 1.5px solid #10b981; padding: 22px 28px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 12px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 0.8px;">
              🌟 ONE SINGLE LINE (Explaining the project to a kid or parent)
            </span>
            <span style="background: #10b981; color: #022c22; font-size: 11px; font-weight: 800; padding: 2px 10px; border-radius: 9999px;">
              CORE FORMULA
            </span>
          </div>
          <div style="font-size: 21px; font-weight: 800; color: #ffffff; line-height: 1.35;">
            "An Uber-like app where university cafeterias post extra hot food, and nearby charities and student volunteers get alerted to pick it up and feed hungry children in 30 minutes before it gets cold!"
          </div>
        </div>

        <!-- 3-Sided Ecosystem Pillar Cards -->
        <div style="font-size: 16px; font-weight: 800; color: #f1f5f9; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span>⚡</span> The 3-Sided Hyper-Local Ecosystem:
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <!-- Pillar 1: Donors -->
          <div class="glass-card" style="border-top: 4px solid #10b981;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 26px;">🍲</span>
              <span style="font-size: 11px; font-weight: 700; color: #34d399; background: rgba(52,211,153,0.1); padding: 3px 8px; border-radius: 6px;">DONORS</span>
            </div>
            <div class="card-title" style="color: #34d399; font-size: 17px;">1. Food Donors</div>
            <p style="font-size: 12px; color: #cbd5e1; font-weight: 700; margin-bottom: 8px;">Cafeterias, Caterers & Restaurants</p>
            <p class="card-desc" style="font-size: 13px;">
              &bull; <strong>60-Second Listing:</strong> Title, quantity & cook time.<br>
              &bull; <strong>AI Spoilage Clock:</strong> Automatic countdown dial.<br>
              &bull; <strong>Meal Converter:</strong> '40 kg Biryani = 80–100 kids'.
            </p>
          </div>

          <!-- Pillar 2: NGOs -->
          <div class="glass-card" style="border-top: 4px solid #38bdf8;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 26px;">🏢</span>
              <span style="font-size: 11px; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 3px 8px; border-radius: 6px;">RECIPIENTS</span>
            </div>
            <div class="card-title" style="color: #38bdf8; font-size: 17px;">2. Verified NGOs</div>
            <p style="font-size: 12px; color: #cbd5e1; font-weight: 700; margin-bottom: 8px;">Orphanages & Local Shelters</p>
            <p class="card-desc" style="font-size: 13px;">
              &bull; <strong>Proximity Radar Map:</strong> Filtered within 3–5 km.<br>
              &bull; <strong>1-Click Claim:</strong> Instantly reserves surplus batch.<br>
              &bull; <strong>Digital QR Receipts:</strong> Automated distribution audit.
            </p>
          </div>

          <!-- Pillar 3: Volunteers -->
          <div class="glass-card" style="border-top: 4px solid #f59e0b;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 26px;">🚴</span>
              <span style="font-size: 11px; font-weight: 700; color: #f59e0b; background: rgba(245,158,11,0.1); padding: 3px 8px; border-radius: 6px;">COURIERS</span>
            </div>
            <div class="card-title" style="color: #fbbf24; font-size: 17px;">3. Student Volunteers</div>
            <p style="font-size: 12px; color: #cbd5e1; font-weight: 700; margin-bottom: 8px;">Campus Cyclists & Bikers</p>
            <p class="card-desc" style="font-size: 13px;">
              &bull; <strong>Uber-Style Alerts:</strong> Notified during commutes.<br>
              &bull; <strong>Fast Delivery:</strong> 15–30 min pick & drop.<br>
              &bull; <strong>Insulated Bags:</strong> Maintain thermal safety.
            </p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Ecosystem Synchronicity: Donor posts &rarr; NGO reserves &rarr; Student biker delivers &rarr; Handshake verified.</div>
        <div class="badge">Slide 4 of 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 5: MAIN FEATURES & OUTPUTS -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand-group">
          <div class="brand-logo">SB</div>
          <div class="brand-name">ShareBite <span>BD</span></div>
        </div>
        <div class="section-pill">Section 2: Key Features & Deliverables</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">2. Main Features: What Will the End System Perform?</h2>
          <p class="slide-subtitle">Four core algorithmic and operational modules solving real friction in food rescue</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.25fr; gap: 30px; height: 470px;">
          <!-- Left: New High-Res Photo -->
          <div class="img-frame">
            <img src="{img_volunteer}" alt="Campus Food Rescue Volunteer">
            <div class="img-overlay-tag">
              📸 Student Volunteer Squad &bull; Rapid 15–30 Min Campus-to-Shelter Rescue
            </div>
          </div>

          <!-- Right: 4 High-Tech Feature Cards -->
          <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
            <div class="glass-card" style="border-left: 4px solid #10b981; padding: 16px 20px;">
              <div class="card-title" style="color: #34d399; font-size: 16px;">
                <span>⏱️</span> 1. 60-Sec Post & AI Spoilage Countdown Meter
              </div>
              <p class="card-desc" style="font-size: 13px;">
                Donor inputs food title and cooking timestamp. The system calculates a dynamic biological expiration countdown based on BFSA parameters and flashes urgency rings.
              </p>
            </div>

            <div class="glass-card" style="border-left: 4px solid #38bdf8; padding: 16px 20px;">
              <div class="card-title" style="color: #38bdf8; font-size: 16px;">
                <span>📍</span> 2. Proximity Radar Map (3 km / 5 km Radial Filter)
              </div>
              <p class="card-desc" style="font-size: 13px;">
                Bypasses notorious Dhaka gridlock by strictly clustering donations within walkable/cycling distance. Food under 2 hours flashes as <strong>'🚨 Critical Priority'</strong>.
              </p>
            </div>

            <div class="glass-card" style="border-left: 4px solid #f59e0b; padding: 16px 20px;">
              <div class="card-title" style="color: #fbbf24; font-size: 16px;">
                <span>🚴</span> 3. Uber-Style Crowdsourced Student Volunteer Dispatch
              </div>
              <p class="card-desc" style="font-size: 13px;">
                Broadcasts micro-rescue notifications to university students commuting home on bicycles/motorcycles with an instant route view and thermal packaging checklist.
              </p>
            </div>

            <div class="glass-card" style="border-left: 4px solid #a855f7; padding: 16px 20px;">
              <div class="card-title" style="color: #c084fc; font-size: 16px;">
                <span>🔒</span> 4. 4-Digit OTP & QR Code Anti-Fraud Protocol
              </div>
              <p class="card-desc" style="font-size: 13px;">
                Zero leakage: The donor only releases food when the volunteer provides a secret 4-digit PIN. Shelter confirms final receipt via dynamic QR code scan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>System Output: Guaranteed hot, safe food delivered in under 30 minutes with 100% digital audit trace.</div>
        <div class="badge">Slide 5 of 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 6: PLAN OF ACTION (TECH OVERVIEW) -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand-group">
          <div class="brand-logo">SB</div>
          <div class="brand-name">ShareBite <span>BD</span></div>
        </div>
        <div class="section-pill">Section 3: Plan of Action & Architecture</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">3. Plan of Action: High-Level Technology Overview</h2>
          <p class="slide-subtitle">Modern open-source stack chosen for rapid response time, relational integrity, and zero hosting expense</p>
        </div>

        <!-- High-Level Architecture Flowchart -->
        <div class="glass-card" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(52, 211, 153, 0.3); padding: 16px 20px; margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 800; color: #34d399; margin-bottom: 10px; text-transform: uppercase;">
            🏗️ System Architecture & Data Flow Pipeline:
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <div style="background: #064e3b; border: 1px solid #10b981; border-radius: 8px; padding: 10px 14px; text-align: center; flex: 1;">
              <div style="font-size: 11px; color: #a7f3d0; font-weight: 700;">1. DONOR PORTAL</div>
              <div style="font-size: 13px; font-weight: 800; color: #fff;">Next.js 16 SSR</div>
              <div style="font-size: 10px; color: #cbd5e1;">60s Listing & AI Meter</div>
            </div>
            <div style="color: #34d399; font-size: 20px; font-weight: 900;">&rarr;</div>
            <div style="background: #0f2b46; border: 1px solid #38bdf8; border-radius: 8px; padding: 10px 14px; text-align: center; flex: 1;">
              <div style="font-size: 11px; color: #bae6fd; font-weight: 700;">2. API & LOGIC</div>
              <div style="font-size: 13px; font-weight: 800; color: #fff;">TypeScript / Zod</div>
              <div style="font-size: 10px; color: #cbd5e1;">Spoilage Algorithm</div>
            </div>
            <div style="color: #38bdf8; font-size: 20px; font-weight: 900;">&rarr;</div>
            <div style="background: #3b1c54; border: 1px solid #c084fc; border-radius: 8px; padding: 10px 14px; text-align: center; flex: 1;">
              <div style="font-size: 11px; color: #f5d0fe; font-weight: 700;">3. DATABASE</div>
              <div style="font-size: 13px; font-weight: 800; color: #fff;">Prisma + PostgreSQL</div>
              <div style="font-size: 10px; color: #cbd5e1;">ACID Claim Locks</div>
            </div>
            <div style="color: #c084fc; font-size: 20px; font-weight: 900;">&rarr;</div>
            <div style="background: #451a03; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px 14px; text-align: center; flex: 1;">
              <div style="font-size: 11px; color: #fde68a; font-weight: 700;">4. RADAR GIS</div>
              <div style="font-size: 13px; font-weight: 800; color: #fff;">Leaflet + OSM</div>
              <div style="font-size: 10px; color: #cbd5e1;">3–5km Radius Filter</div>
            </div>
            <div style="color: #fbbf24; font-size: 20px; font-weight: 900;">&rarr;</div>
            <div style="background: #022c22; border: 1px solid #34d399; border-radius: 8px; padding: 10px 14px; text-align: center; flex: 1;">
              <div style="font-size: 11px; color: #a7f3d0; font-weight: 700;">5. DISPATCH PWA</div>
              <div style="font-size: 13px; font-weight: 800; color: #fff;">WebSockets & FCM</div>
              <div style="font-size: 10px; color: #cbd5e1;">4-Digit OTP Verify</div>
            </div>
          </div>
        </div>

        <!-- 3 Technology Choice Justification Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <div class="glass-card" style="border-left: 4px solid #10b981;">
            <div class="card-title" style="color: #34d399; font-size: 16px;">
              <span>💻</span> Frontend & PWA: Next.js 16
            </div>
            <p class="card-desc" style="font-size: 13px;">
              <strong>Why Chosen:</strong> Server-Side Rendering (SSR) delivers sub-100ms cold start times on 4G cellular data. Progressive Web App (PWA) enables instant volunteer dispatch without app store friction.
            </p>
          </div>

          <div class="glass-card" style="border-left: 4px solid #38bdf8;">
            <div class="card-title" style="color: #38bdf8; font-size: 16px;">
              <span>🗄️</span> Data Layer: Prisma + PostgreSQL
            </div>
            <p class="card-desc" style="font-size: 13px;">
              <strong>Why Chosen:</strong> Strict ACID transactional guarantees prevent double-claiming of food batches. Type-safe Prisma models ensure zero runtime schema mismatch across the entire stack.
            </p>
          </div>

          <div class="glass-card" style="border-left: 4px solid #f59e0b;">
            <div class="card-title" style="color: #fbbf24; font-size: 16px;">
              <span>🗺️</span> Spatial GIS: Leaflet.js + OSM
            </div>
            <p class="card-desc" style="font-size: 13px;">
              <strong>Why Chosen:</strong> 100% open-source mapping engine without expensive Google Maps API credit card billing. Performs fast client-side Haversine circular radius queries on low-spec phones.
            </p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Rationale: Zero cloud subscription costs, end-to-end TypeScript safety, and instantaneous mobile performance.</div>
        <div class="badge">Slide 6 of 7</div>
      </div>
    </section>


    <!-- ========================================== -->
    <!-- SLIDE 7: TIMELINE & ROADMAP -->
    <!-- ========================================== -->
    <section class="slide">
      <div class="slide-header">
        <div class="brand-group">
          <div class="brand-logo">SB</div>
          <div class="brand-name">ShareBite <span>BD</span></div>
        </div>
        <div class="section-pill">Section 4: Phased Roadmap & Defense</div>
      </div>

      <div class="slide-body">
        <div class="title-block">
          <h2 class="slide-title">4. Project Timeline: 16-Week Agile Milestone Roadmap</h2>
          <p class="slide-subtitle">Structured semester progression from system architecture to live UIU campus field pilot and defense</p>
        </div>

        <!-- 4 Milestone Sprints -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px;">
          <!-- Sprint 1 -->
          <div class="glass-card" style="border-top: 4px solid #10b981; padding: 20px 18px;">
            <div style="font-size: 11px; font-weight: 800; color: #10b981; letter-spacing: 0.5px;">WEEKS 1 – 4</div>
            <div class="card-title" style="font-size: 15px; margin: 4px 0 8px 0; color: #ffffff;">Phase 1: Architecture</div>
            <p class="card-desc" style="font-size: 12.5px; line-height: 1.55;">
              &bull; Comprehensive SRS documentation<br>
              &bull; Prisma relational schema modeling<br>
              &bull; 3-Portal responsive UI setup<br>
              &bull; Role-based authentication
            </p>
            <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: #34d399; background: rgba(52,211,153,0.1); padding: 4px 8px; border-radius: 6px;">
              Status: 100% Completed
            </div>
          </div>

          <!-- Sprint 2 -->
          <div class="glass-card" style="border-top: 4px solid #38bdf8; padding: 20px 18px;">
            <div style="font-size: 11px; font-weight: 800; color: #38bdf8; letter-spacing: 0.5px;">WEEKS 5 – 8</div>
            <div class="card-title" style="font-size: 15px; margin: 4px 0 8px 0; color: #ffffff;">Phase 2: Core Engine</div>
            <p class="card-desc" style="font-size: 12.5px; line-height: 1.55;">
              &bull; AI Spoilage dynamic countdown<br>
              &bull; Leaflet geospatial radar GIS (3km)<br>
              &bull; 4-Digit OTP handshake logic<br>
              &bull; Atomic claim transaction engine
            </p>
            <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 4px 8px; border-radius: 6px;">
              Status: 90% Completed
            </div>
          </div>

          <!-- Sprint 3 -->
          <div class="glass-card" style="border-top: 4px solid #f59e0b; padding: 20px 18px;">
            <div style="font-size: 11px; font-weight: 800; color: #f59e0b; letter-spacing: 0.5px;">WEEKS 9 – 12</div>
            <div class="card-title" style="font-size: 15px; margin: 4px 0 8px 0; color: #ffffff;">Phase 3: Campus Pilot</div>
            <p class="card-desc" style="font-size: 12.5px; line-height: 1.55;">
              &bull; UIU Cafeteria live trial run<br>
              &bull; Student cyclist volunteer onboarding<br>
              &bull; Satarkul orphanage delivery test<br>
              &bull; Turnaround latency optimization
            </p>
            <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: #fbbf24; background: rgba(245,158,11,0.1); padding: 4px 8px; border-radius: 6px;">
              Target: Live Field Run
            </div>
          </div>

          <!-- Sprint 4 -->
          <div class="glass-card" style="border-top: 4px solid #c084fc; padding: 20px 18px;">
            <div style="font-size: 11px; font-weight: 800; color: #c084fc; letter-spacing: 0.5px;">WEEKS 13 – 16</div>
            <div class="card-title" style="font-size: 15px; margin: 4px 0 8px 0; color: #ffffff;">Phase 4: Audit & Defense</div>
            <p class="card-desc" style="font-size: 12.5px; line-height: 1.55;">
              &bull; Concurrency & stress testing<br>
              &bull; Anti-fraud security penetration test<br>
              &bull; Project impact report & analytics<br>
              &bull; Final SE Lab defense presentation
            </p>
            <div style="margin-top: 10px; font-size: 11px; font-weight: 700; color: #c084fc; background: rgba(192,132,252,0.1); padding: 4px 8px; border-radius: 6px;">
              Target: Final Defense
            </div>
          </div>
        </div>

        <!-- Executive Closing Card -->
        <div class="glass-card glass-card-glow" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 28px; background: linear-gradient(135deg, rgba(6, 78, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);">
          <div>
            <div style="font-size: 17px; font-weight: 800; color: #ffffff;">
              🚀 Ready to Transform Campus Food Surplus into Immediate Hunger Relief
            </div>
            <div style="font-size: 13.5px; color: #a7f3d0; margin-top: 3px;">
              Zero commercial barrier &bull; Real community impact &bull; Rigorous Software Engineering execution
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: 800; color: #34d399;">Q & A SESSION</div>
            <div style="font-size: 12px; color: #94a3b8;">Thank you! Questions are welcome.</div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <div>Software Engineering Lab Proposal &bull; 10-Minute Presentation Deck</div>
        <div class="badge">Slide 7 of 7 &bull; End of Deck</div>
      </div>
    </section>

  </div>

</body>
</html>
"""

html_path = os.path.join(base_dir, "ShareBite_BD_SE_Lab_Presentation.html")
with open(html_path, "wb") as f:
    f.write(html_content.encode("utf-8"))

print(f"Executive HTML generated cleanly ({len(html_content)} bytes)")

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
    print(f"SUCCESS: Visual PDF generated ({os.path.getsize(pdf_path)/1024:.1f} KB) at: {pdf_path}")
else:
    print(f"Error compiling PDF: {res.stderr}")
