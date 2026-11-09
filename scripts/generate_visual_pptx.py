# -*- coding: utf-8 -*-
"""
ShareBite BD - Visual, Key-Point-Driven SE Lab Project Proposal Presentation
Follows SE Lab Project Proposal Guideline:
1. Problem Identification (Backed by Data)
2. Solution (The Idea and Features)
3. Plan of Action (High-Level Technology Overview)
4. Timeline
Embeds real images, concise key points, big stat numbers, and 16:9 widescreen layout.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Scheme
    DARK_BG = RGBColor(6, 78, 59)          # Deep Forest Emerald #064E3B
    DARK_CARD = RGBColor(2, 44, 34)        # Darker Emerald #022C22
    PRIMARY_EMERALD = RGBColor(5, 150, 105)# Emerald #059669
    ACCENT_MINT = RGBColor(52, 211, 153)   # Mint #34D399
    SLATE_DARK = RGBColor(15, 23, 42)      # Slate 900
    SLATE_MUTED = RGBColor(71, 85, 105)    # Slate 600
    CARD_BG = RGBColor(248, 250, 252)      # Slate 50
    CARD_BORDER = RGBColor(226, 232, 240)  # Slate 200
    
    ROSE_RED = RGBColor(225, 29, 72)
    ROSE_BG = RGBColor(255, 241, 242)
    AMBER_ORANGE = RGBColor(217, 119, 6)
    AMBER_BG = RGBColor(255, 251, 235)
    BLUE_COLOR = RGBColor(37, 99, 235)
    BLUE_BG = RGBColor(239, 246, 255)
    PURPLE_COLOR = RGBColor(124, 58, 237)
    PURPLE_BG = RGBColor(250, 245, 255)

    base_dir = os.getcwd()
    img_surplus = os.path.join(base_dir, "public", "images", "surplus-food-containers.jpg")
    img_children = os.path.join(base_dir, "public", "images", "dhaka-children-empty-plates.jpg")
    img_hero = os.path.join(base_dir, "public", "images", "bangladesh-food-rescue-hero.jpg")
    img_map = os.path.join(base_dir, "public", "images", "bangladesh-3d-map-hero.png")

    def add_header(slide, section_tag, slide_title, subtitle=""):
        # Section Pill
        tag_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(2.8), Inches(0.35))
        tag_box.fill.solid()
        tag_box.fill.fore_color.rgb = RGBColor(236, 253, 245)
        tag_box.line.color.rgb = ACCENT_MINT
        t_tf = tag_box.text_frame
        p_tag = t_tf.paragraphs[0]
        p_tag.text = f"SHAREBITE BD  •  {section_tag.upper()}"
        p_tag.font.size = Pt(9.5)
        p_tag.font.bold = True
        p_tag.font.color.rgb = PRIMARY_EMERALD
        p_tag.alignment = PP_ALIGN.CENTER

        # Slide Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.55))
        tf_t = t_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = slide_title
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = SLATE_DARK

        # Subtitle
        if subtitle:
            s_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.25), Inches(11.7), Inches(0.35))
            tf_s = s_box.text_frame
            tf_s.word_wrap = True
            p_s = tf_s.paragraphs[0]
            p_s.text = subtitle
            p_s.font.size = Pt(11.5)
            p_s.font.color.rgb = SLATE_MUTED

    def add_footer(slide, slide_num):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.9), Inches(11.7), Inches(0.35))
        tf = footer_box.text_frame
        p = tf.paragraphs[0]
        p.text = f"Software Engineering Lab Project Proposal  •  10-Minute Presentation Deck                                            Slide {slide_num} of 7"
        p.font.size = Pt(9.5)
        p.font.color.rgb = SLATE_MUTED

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = DARK_BG
    bg1.line.fill.background()

    # Pill badge
    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.0), Inches(4.5), Inches(0.45))
    badge.fill.solid()
    badge.fill.fore_color.rgb = DARK_CARD
    badge.line.color.rgb = ACCENT_MINT
    b_p = badge.text_frame.paragraphs[0]
    b_p.text = "🚀 SE LAB 10-MINUTE PROJECT PROPOSAL"
    b_p.font.size = Pt(11)
    b_p.font.bold = True
    b_p.font.color.rgb = ACCENT_MINT
    b_p.alignment = PP_ALIGN.CENTER

    # Main Title
    t_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.65), Inches(11.3), Inches(1.6))
    t_tf = t_box.text_frame
    p1 = t_tf.paragraphs[0]
    p1.text = "ShareBite BD"
    p1.font.size = Pt(50)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(255, 255, 255)

    p2 = t_tf.add_paragraph()
    p2.text = "Smart Surplus Food Rescue & Safety-Compliant Redistribution Network"
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = ACCENT_MINT

    # 3 Pill Badges
    pills = [
        ("📍 Pilot: UIU Campus & Badda", Inches(1.0)),
        ("🎯 UN SDG 2 (Zero Hunger) & 12", Inches(4.2)),
        ("⚡ 15–30 Min Rescue Velocity", Inches(7.7))
    ]
    for text, left_in in pills:
        pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_in, Inches(3.3), Inches(3.0), Inches(0.45))
        pill.fill.solid()
        pill.fill.fore_color.rgb = DARK_CARD
        pill.line.color.rgb = ACCENT_MINT
        p = pill.text_frame.paragraphs[0]
        p.text = text
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = RGBColor(255, 255, 255)
        p.alignment = PP_ALIGN.CENTER

    # Team Roster Card
    meta = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(4.2), Inches(11.3), Inches(1.9))
    meta.fill.solid()
    meta.fill.fore_color.rgb = DARK_CARD
    meta.line.color.rgb = PRIMARY_EMERALD
    m_tf = meta.text_frame
    m_tf.word_wrap = True

    p = m_tf.paragraphs[0]
    p.text = "PROJECT METADATA & TEAM ROSTER"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_MINT

    p = m_tf.add_paragraph()
    p.text = "Course: Software Engineering Lab (CSE 4xxx)  •  Academic Year: 2026-2027  •  Tech: Next.js, Prisma, Leaflet GIS"
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(203, 213, 225)

    p = m_tf.add_paragraph()
    p.text = "Team Members: [Member 1 (Lead), Member 2 (Backend), Member 3 (GIS), Member 4 (QA)  |  Student IDs: 011 2X1 XXX]"
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)

    s1.shapes.add_textbox(Inches(1.0), Inches(6.8), Inches(11.3), Inches(0.4)).text_frame.paragraphs[0].text = (
        "Department of Computer Science & Engineering (CSE)                                                     Slide 1 of 7"
    )

    s1.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1 Min):\n"
        "Good day faculty and fellow classmates. Today our team presents our SE Lab Proposal: 'ShareBite BD'. "
        "It is a hyper-local, real-time software network designed to solve the critical urban crisis of food waste and hunger in Dhaka."
    )

    # ==========================================
    # SLIDE 2: PROBLEM IDENTIFICATION (Visual Split)
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Section 1", "1. Problem Identification: What Problem Are We Solving?",
               "The critical paradox of cooked food waste vs. street hunger in Dhaka City")
    add_footer(s2, 2)

    # Left: High Quality Image
    if os.path.exists(img_surplus):
        s2.shapes.add_picture(img_surplus, Inches(0.8), Inches(1.8), Inches(4.8), Inches(4.7))

    # Right: 3 Key Points (Compact, High-Impact Cards)
    problem_points = [
        ("🔴 The Daily Food Dump", 
         "Every night, university cafeterias (like UIU), restaurants & wedding caterers discard massive pots of safe, freshly cooked meals into dumpsters due to zero instant charity links.",
         ROSE_RED, ROSE_BG),
        ("⏳ The 4-Hour Biological Clock", 
         "Cooked food enters the bacterial danger zone (5°C–60°C). Under BFSA safety guidelines, food spoils before slow manual phone calls can coordinate a pickup.",
         AMBER_ORANGE, AMBER_BG),
        ("🚫 The Missing Logistics Link", 
         "Charities lack standby transport at 10 PM. Food exists, hungry people are only 2 km away, but zero automated micro-logistics platform connects them in time.",
         BLUE_COLOR, BLUE_BG)
    ]

    top_y = 1.8
    for title, desc, col, bg_col in problem_points:
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.9), Inches(top_y), Inches(6.6), Inches(1.4))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_col
        card.line.color.rgb = col
        tf = card.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = SLATE_DARK

        top_y += 1.65

    s2.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "Section 1: Problem Identification. As seen in the photo, large pots of untouched, cooked meals are tossed into city bins daily. "
        "The root cause is the 4-hour biological decay window. Hot food spoils fast, and manual phone calls fail. "
        "It's not a food shortage problem; it's a software coordination failure."
    )

    # ==========================================
    # SLIDE 3: EVIDENCE & DATA (Stats + Image)
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Section 1", "1. Evidence & Data: Backed by Research & Real-World Impact",
               "Quantifiable facts, biological thresholds, and social impact indicators")
    add_footer(s3, 3)

    # 4 Stat Boxes (Top Row)
    stats = [
        ("10.7M Tons", "Food Wasted / Year", "UNEP Food Waste Index (BD)", ROSE_RED, ROSE_BG),
        ("4 Hours", "Biological Safety Window", "BFSA Bacterial Danger Zone", AMBER_ORANGE, AMBER_BG),
        ("3.8M People", "Urban Food-Insecure", "BBS & World Bank Slum Data", BLUE_COLOR, BLUE_BG),
        ("0% Audit Trail", "Manual Charity Today", "Zero Verifiable CSR Data", PRIMARY_EMERALD, RGBColor(236, 253, 245))
    ]
    x_pos = 0.8
    for val, lbl, sub, col, bg_col in stats:
        box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x_pos), Inches(1.8), Inches(2.75), Inches(1.5))
        box.fill.solid()
        box.fill.fore_color.rgb = bg_col
        box.line.color.rgb = col
        tf = box.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = val
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = col
        p.alignment = PP_ALIGN.CENTER

        p = tf.add_paragraph()
        p.text = lbl
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = SLATE_DARK
        p.alignment = PP_ALIGN.CENTER

        p = tf.add_paragraph()
        p.text = sub
        p.font.size = Pt(9)
        p.font.color.rgb = SLATE_MUTED
        p.alignment = PP_ALIGN.CENTER

        x_pos += 2.98

    # Bottom Row: Left Photo + Right Real-world Impact Cards
    if os.path.exists(img_children):
        s3.shapes.add_picture(img_children, Inches(0.8), Inches(3.6), Inches(4.5), Inches(3.0))

    imp_card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.6), Inches(3.6), Inches(6.9), Inches(3.0))
    imp_card.fill.solid()
    imp_card.fill.fore_color.rgb = CARD_BG
    imp_card.line.color.rgb = PRIMARY_EMERALD
    itf = imp_card.text_frame
    itf.word_wrap = True

    p = itf.paragraphs[0]
    p.text = "🌍 Tangible Real-World Impact (Key Takeaways):"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_EMERALD

    impact_points = [
        ("Zero Hunger (UN SDG 2)", "Directly supplies safe, nutritious hot meals to orphanages, street children, and urban laborers with preserved human dignity."),
        ("Health & Food Safety", "Strictly enforces BFSA thermal holding standards (>65°C hot, <4°C cold), eliminating bacterial contamination and food poisoning."),
        ("Climate Action (UN SDG 12)", "Rescuing food prevents organic waste decomposition in open landfills, directly cutting urban methane and greenhouse gas emissions.")
    ]
    for heading, text in impact_points:
        p = itf.add_paragraph()
        p.text = f"• {heading}: {text}"
        p.font.size = Pt(11)
        p.font.color.rgb = SLATE_DARK

    s3.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "Here is the data backing our proposal: UNEP confirms 10.7 million metric tons of food waste in Bangladesh annually. "
        "As seen in the photo, millions of urban children face daily nutritional deprivation. "
        "ShareBite BD addresses UN SDG 2 (Zero Hunger) and cuts urban methane emissions under SDG 12."
    )

    # ==========================================
    # SLIDE 4: SOLUTION (The Idea & Approach)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Section 2", "2. Solution: The Core Idea & System Approach",
               "A synchronized 3-sided micro-logistics platform engineered for 15–30 minute rescue velocity")
    add_footer(s4, 4)

    # Hero Box: ONE SINGLE LINE
    one_liner = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(1.4))
    one_liner.fill.solid()
    one_liner.fill.fore_color.rgb = DARK_BG
    one_liner.line.color.rgb = ACCENT_MINT
    ot_tf = one_liner.text_frame
    ot_tf.word_wrap = True

    p = ot_tf.paragraphs[0]
    p.text = "🌟 ONE SINGLE LINE (Explainable to a kid or parent):"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_MINT

    p = ot_tf.add_paragraph()
    p.text = '"An Uber-like app where university cafeterias post extra hot food, and nearby charities and student volunteers get alerted to pick it up and feed hungry people before it gets cold and goes bad!"'
    p.font.size = Pt(15.5)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)

    # 3-Pillar Ecosystem Grid
    pillars = [
        ("🍲 1. Food Donors", "Cafeterias & Caterers", 
         "• 60-Second listing process\n• AI Spoilage & Safety Meter\n• Auto meal quantity calculator", 
         PRIMARY_EMERALD, RGBColor(236, 253, 245)),
        ("🏢 2. Verified NGOs", "Charities & Shelters", 
         "• Proximity Radar Map (3–5 km)\n• 1-Click rescue claim\n• Digital QR receipt verification", 
         BLUE_COLOR, BLUE_BG),
        ("🚴 3. Student Volunteers", "Campus Biker Squad", 
         "• Uber-style instant dispatch\n• Turn-by-turn route navigation\n• Insulated thermal carrier check", 
         AMBER_ORANGE, AMBER_BG)
    ]

    p_left = 0.8
    for title, sub, bullets, col, bg_col in pillars:
        pc = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(p_left), Inches(3.5), Inches(3.7), Inches(3.1))
        pc.fill.solid()
        pc.fill.fore_color.rgb = bg_col
        pc.line.color.rgb = col
        ptf = pc.text_frame
        ptf.word_wrap = True

        p = ptf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = col

        p = ptf.add_paragraph()
        p.text = sub
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = SLATE_MUTED

        for line in bullets.split("\n"):
            p = ptf.add_paragraph()
            p.text = line
            p.font.size = Pt(11)
            p.font.color.rgb = SLATE_DARK

        p_left += 4.0

    s4.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "Section 2: Our single-line description: 'An Uber-like app where university cafeterias post extra food, "
        "and nearby charities & volunteers pick it up to feed hungry people before it spoils.' "
        "The system coordinates three parties: Donors post in 60s, NGOs claim on a radar map, and Student Volunteers deliver in 15–30 mins."
    )

    # ==========================================
    # SLIDE 5: MAIN FEATURES (Visual Hero + 4 Cards)
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Section 2", "2. Main Features: What Will the End System Perform?",
               "Idea-driven core features solving real-world logistical and safety friction")
    add_footer(s5, 5)

    # Left: Hero Delivery Photo
    if os.path.exists(img_hero):
        s5.shapes.add_picture(img_hero, Inches(0.8), Inches(1.8), Inches(4.5), Inches(4.8))

    # Right: 4 Punchy Feature Cards
    features = [
        ("⚡ 1. 60-Sec Listing & AI Spoilage Meter", 
         "Live temperature gauge (>65°C safe holding) + countdown clock. Automatically converts raw weight into human meals (e.g., '40 kg Biryani = 80–100 meals').", 
         PRIMARY_EMERALD, RGBColor(236, 253, 245)),
        
        ("📍 2. Proximity Radar Map (3–5 km)", 
         "Filters donations strictly within short radius to bypass Dhaka traffic. Batches under 2 hours flash as '🚨 Urgent Rescues' with instant audio alerts.", 
         BLUE_COLOR, BLUE_BG),
        
        ("🚴 3. Uber-Style Volunteer Dispatch", 
         "Crowdsources campus student cyclists and bikers on their daily commutes, providing verified thermal bag checklists and live navigation.", 
         AMBER_ORANGE, AMBER_BG),
        
        ("🔒 4. 4-Digit OTP & QR Code Anti-Fraud", 
         "Zero theft/misuse: Donors verify volunteer's 4-digit PIN (e.g. 7429) before handover; destination shelter scans dynamic QR token on arrival.", 
         PURPLE_COLOR, PURPLE_BG)
    ]

    f_top = 1.8
    for title, desc, col, bg_col in features:
        fc = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.6), Inches(f_top), Inches(6.9), Inches(1.12))
        fc.fill.solid()
        fc.fill.fore_color.rgb = bg_col
        fc.line.color.rgb = col
        ftf = fc.text_frame
        ftf.word_wrap = True

        p = ftf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12.5)
        p.font.bold = True
        p.font.color.rgb = col

        p = ftf.add_paragraph()
        p.text = desc
        p.font.size = Pt(10.5)
        p.font.color.rgb = SLATE_DARK

        f_top += 1.22

    s5.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "As seen on the left photo, our volunteers deliver fresh meals in thermal boxes. "
        "The 4 key features are: 1. AI Spoilage Meter with automated meal conversion; 2. Radar Map with 3–5 km radius; "
        "3. Uber-style student dispatch; and 4. A 4-digit OTP & QR anti-fraud verification ensuring zero food diversion."
    )

    # ==========================================
    # SLIDE 6: PLAN OF ACTION (High-Level Tech Stack + Map)
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Section 3", "3. Plan of Action: High-Level Technology Overview",
               "Production-grade, modern open-source stack engineered for velocity and zero hosting cost")
    add_footer(s6, 6)

    # Left: 3 Tech Stack Cards
    tech_stack = [
        ("💻 Frontend Framework", "Next.js 16 + React 19 + Tailwind CSS v4", 
         "Server-Side Rendering (SSR) delivers sub-100ms load times and full mobile responsiveness without native app installation friction.", 
         PRIMARY_EMERALD, RGBColor(236, 253, 245)),
        
        ("🗄️ Backend & Database", "Prisma ORM + PostgreSQL + TypeScript / Zod", 
         "Strongly-typed relational data models (Users, Donations, Claims, Receipts) with atomic state transitions and zero runtime type errors.", 
         BLUE_COLOR, BLUE_BG),
        
        ("🗺️ Geospatial Maps & Routing", "Leaflet.js + OpenStreetMap", 
         "100% free, open-source geospatial routing & Haversine distance calculations without requiring expensive Google Maps API billing.", 
         AMBER_ORANGE, AMBER_BG)
    ]

    t_top = 1.8
    for title, tech, why, col, bg_col in tech_stack:
        tc = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(t_top), Inches(7.4), Inches(1.5))
        tc.fill.solid()
        tc.fill.fore_color.rgb = bg_col
        tc.line.color.rgb = col
        ttf = tc.text_frame
        ttf.word_wrap = True

        p = ttf.paragraphs[0]
        p.text = f"{title}:  {tech}"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = col

        p = ttf.add_paragraph()
        p.text = f"• Why: {why}"
        p.font.size = Pt(11)
        p.font.color.rgb = SLATE_DARK

        t_top += 1.65

    # Right: Map Visualization Image
    if os.path.exists(img_map):
        s6.shapes.add_picture(img_map, Inches(8.5), Inches(1.8), Inches(4.0), Inches(4.8))

    s6.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "Section 3 covers our Plan of Action. We use Next.js 16 for mobile web speed, Prisma ORM with PostgreSQL for data integrity, "
        "and Leaflet with OpenStreetMap for 100% free geospatial calculations across Dhaka Metro, as visualized on the map. "
        "This stack costs $0 in cloud hosting, deploying freely on Vercel and Supabase."
    )

    # ==========================================
    # SLIDE 7: TIMELINE & CONCLUSION
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Section 4", "4. Project Timeline: 16-Week Implementation Roadmap",
               "Structured semester milestones leading to a live campus pilot and defense readiness")
    add_footer(s7, 7)

    # 4 Sprint Milestone Cards
    sprints = [
        ("Weeks 1 – 4", "Sprint 1: Architecture & UX", 
         ["• Software Requirements (SRS)", "• Prisma DB Schema & Models", "• Responsive 3-Portal UI Shells", "• Role-Based Auth (RBAC)"], 
         PRIMARY_EMERALD),
        
        ("Weeks 5 – 8", "Sprint 2: Core Rescue Engine", 
         ["• AI Spoilage Countdown Engine", "• Leaflet Radar GIS Integration", "• 4-Digit OTP & QR Protocol", "• Claim State Transactions"], 
         BLUE_COLOR),
        
        ("Weeks 9 – 12", "Sprint 3: Campus Live Pilot", 
         ["• UIU Cafeteria Live Integration", "• Badda Eateries Onboarding", "• Student Biker Dispatch Runs", "• Mastul Foundation Delivery"], 
         AMBER_ORANGE),
        
        ("Weeks 13 – 16", "Sprint 4: Audit & Defense", 
         ["• Full System Testing & QA", "• CSR Impact Analytics Engine", "• Security & Performance Audit", "• Final Defense Presentation"], 
         PURPLE_COLOR)
    ]

    s_left = 0.8
    for wks, name, items, col in sprints:
        sc = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(s_left), Inches(1.8), Inches(2.75), Inches(3.0))
        sc.fill.solid()
        sc.fill.fore_color.rgb = CARD_BG
        sc.line.color.rgb = col
        stf = sc.text_frame
        stf.word_wrap = True

        p = stf.paragraphs[0]
        p.text = wks.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col

        p = stf.add_paragraph()
        p.text = name
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = SLATE_DARK

        for it in items:
            p = stf.add_paragraph()
            p.text = it
            p.font.size = Pt(10.5)
            p.font.color.rgb = SLATE_MUTED

        s_left += 2.98

    # Bottom Summary & Q&A Callout
    fin = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.1), Inches(11.7), Inches(1.6))
    fin.fill.solid()
    fin.fill.fore_color.rgb = DARK_BG
    fin.line.color.rgb = ACCENT_MINT
    ftf = fin.text_frame
    ftf.word_wrap = True

    p = ftf.paragraphs[0]
    p.text = "🚀 Summary & Conclusion: Zero Waste, Zero Hunger"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_MINT

    p = ftf.add_paragraph()
    p.text = "With a zero-cost infrastructure plan, an authentic campus pilot at UIU, and strict food safety compliance, our team is fully prepared to deliver a high-scoring, socially impactful software engineering project."
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(255, 255, 255)

    p = ftf.add_paragraph()
    p.text = "Thank you faculty and classmates! Floor is open for Q&A. 🤝"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_MINT

    s7.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "To conclude, our timeline spans 16 weeks across 4 sprints. Sprint 3 is our highlight: conducting a live campus pilot "
        "at UIU Central Cafeteria with student volunteers. Thank you for your time, we are now ready for your questions!"
    )

    out_path = os.path.join(base_dir, "ShareBite_BD_SE_Lab_Presentation.pptx")
    prs.save(out_path)
    print(f"SUCCESS: Visual PPTX created ({os.path.getsize(out_path) / 1024:.1f} KB) at: {out_path}")

if __name__ == "__main__":
    build_presentation()
