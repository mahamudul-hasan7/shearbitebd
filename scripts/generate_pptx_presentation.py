# -*- coding: utf-8 -*-
"""
ShareBite BD - SE Lab Project Proposal Presentation Generator (PPTX)
Adheres strictly to the SE Lab Project Proposal Guideline:
1. Problem Identification (Backed by Data)
2. Solution (The Idea and Features)
3. Plan of Action (High-Level Technology Overview)
4. Timeline
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    DARK_BG = RGBColor(6, 78, 59)       # Deep Emerald #064E3B
    DARK_CARD = RGBColor(2, 44, 34)     # Darker Emerald #022C22
    LIGHT_BG = RGBColor(255, 255, 255)  # White
    PRIMARY_EMERALD = RGBColor(5, 150, 105) # Emerald #059669
    ACCENT_MINT = RGBColor(52, 211, 153)    # Mint #34D399
    SLATE_DARK = RGBColor(15, 23, 42)       # Slate 900
    SLATE_MUTED = RGBColor(71, 85, 105)     # Slate 600
    SLATE_LIGHT = RGBColor(241, 245, 249)   # Slate 100
    BORDER_COLOR = RGBColor(226, 232, 240)  # Slate 200
    CARD_BG = RGBColor(248, 250, 252)       # Slate 50
    
    ROSE_RED = RGBColor(225, 29, 72)
    ROSE_BG = RGBColor(255, 241, 242)
    AMBER_ORANGE = RGBColor(217, 119, 6)
    AMBER_BG = RGBColor(255, 251, 235)
    BLUE_COLOR = RGBColor(37, 99, 235)
    BLUE_BG = RGBColor(239, 246, 255)
    PURPLE_COLOR = RGBColor(124, 58, 237)
    PURPLE_BG = RGBColor(250, 245, 255)

    def add_header(slide, section_tag, slide_title, subtitle=""):
        # Brand Tag / Eyebrow
        brand_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8), Inches(0.35))
        tf_b = brand_box.text_frame
        tf_b.word_wrap = True
        p_b = tf_b.paragraphs[0]
        p_b.text = f"SHAREBITE BD  •  {section_tag.upper()}"
        p_b.font.size = Pt(10)
        p_b.font.bold = True
        p_b.font.color.rgb = PRIMARY_EMERALD

        # Slide Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.6))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = slide_title
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = SLATE_DARK

        # Subtitle
        if subtitle:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.25), Inches(11.7), Inches(0.4))
            tf_s = sub_box.text_frame
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
    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.1), Inches(4.5), Inches(0.45))
    badge.fill.solid()
    badge.fill.fore_color.rgb = DARK_CARD
    badge.line.color.rgb = ACCENT_MINT
    b_tf = badge.text_frame
    b_p = b_tf.paragraphs[0]
    b_p.text = "🚀 SE LAB 10-MINUTE PROJECT PROPOSAL"
    b_p.font.size = Pt(11)
    b_p.font.bold = True
    b_p.font.color.rgb = ACCENT_MINT
    b_p.alignment = PP_ALIGN.CENTER

    # Title
    t_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(1.5))
    t_tf = t_box.text_frame
    t_p = t_tf.paragraphs[0]
    t_p.text = "ShareBite BD"
    t_p.font.size = Pt(48)
    t_p.font.bold = True
    t_p.font.color.rgb = RGBColor(255, 255, 255)

    sub_p = t_tf.add_paragraph()
    sub_p.text = "Smart Surplus Food Rescue & Safety-Compliant Redistribution Network"
    sub_p.font.size = Pt(20)
    sub_p.font.bold = True
    sub_p.font.color.rgb = ACCENT_MINT

    # Metadata Card
    meta_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(3.8), Inches(11.3), Inches(1.8))
    meta_card.fill.solid()
    meta_card.fill.fore_color.rgb = DARK_CARD
    meta_card.line.color.rgb = RGBColor(16, 185, 129)
    m_tf = meta_card.text_frame
    m_tf.word_wrap = True

    p1 = m_tf.paragraphs[0]
    p1.text = "COURSE: Software Engineering Lab (CSE 4xxx)  |  ACADEMIC YEAR: 2026-2027"
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = ACCENT_MINT

    p2 = m_tf.add_paragraph()
    p2.text = "TARGET PILOT: UIU Central Cafeteria & Badda Metro Area  •  SDG ALIGNMENT: SDG 2 (Zero Hunger) & SDG 12"
    p2.font.size = Pt(11.5)
    p2.font.color.rgb = RGBColor(203, 213, 225)

    p3 = m_tf.add_paragraph()
    p3.text = "TEAM ROSTER: [Your Group No. / Team Member Names & Student IDs Here]"
    p3.font.size = Pt(11.5)
    p3.font.bold = True
    p3.font.color.rgb = RGBColor(255, 255, 255)

    # Footer
    f1 = s1.shapes.add_textbox(Inches(1.0), Inches(6.8), Inches(11.3), Inches(0.4))
    f1_p = f1.text_frame.paragraphs[0]
    f1_p.text = "Department of Computer Science & Engineering (CSE)                                                     Slide 1 of 7"
    f1_p.font.size = Pt(10)
    f1_p.font.color.rgb = ACCENT_MINT

    s1.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1 Min):\n"
        "Good morning/afternoon honorable faculty and fellow students. Today, our team is presenting the Software "
        "Engineering Lab Project Proposal for 'ShareBite BD'. This is a hyper-local, real-time software network designed "
        "to solve the tragic paradox of urban food waste and food insecurity in Dhaka City."
    )

    # ==========================================
    # SLIDE 2: PROBLEM IDENTIFICATION
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "Section 1", "1. Problem Identification: What Problem Are We Solving?", 
               "Understanding the critical paradox of urban food waste and local hunger")
    add_footer(s2, 2)

    # Card 1: Core Problem
    c1 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.7), Inches(2.8))
    c1.fill.solid()
    c1.fill.fore_color.rgb = ROSE_BG
    c1.line.color.rgb = ROSE_RED
    c1_tf = c1.text_frame
    c1_tf.word_wrap = True
    p = c1_tf.paragraphs[0]
    p.text = "⚠️ The Tragic Paradox: Good Food Dumped in Bins"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ROSE_RED

    bullets1 = [
        "Every single day, university cafeterias (like UIU Central Cafeteria), event caterers, and restaurants cook massive batches of fresh food.",
        "At the end of service hours, huge pots of untouched, wholesome food remain unsold and discarded into garbage dumps.",
        "Meanwhile, thousands of street children and slum dwellers in nearby neighborhoods go to bed hungry."
    ]
    for b in bullets1:
        p = c1_tf.add_paragraph()
        p.text = f"• {b}"
        p.font.size = Pt(11)
        p.font.color.rgb = SLATE_DARK

    # Card 2: The Biological Window
    c2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(2.8))
    c2.fill.solid()
    c2.fill.fore_color.rgb = AMBER_BG
    c2.line.color.rgb = AMBER_ORANGE
    c2_tf = c2.text_frame
    c2_tf.word_wrap = True
    p = c2_tf.paragraphs[0]
    p.text = "⏱️ The 4-Hour 'Danger Zone' (Time Decay)"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER_ORANGE

    bullets2 = [
        "Under Bangladesh Food Safety Authority (BFSA) guidelines, cooked warm meals must be consumed within 4 hours at room temperature.",
        "After 4 hours, rapid bacterial multiplication (e.g., Bacillus cereus, Salmonella) makes food unsafe.",
        "Traditional manual phone calling takes hours; charities lack transport, and donors fear legal liability so they simply throw it away."
    ]
    for b in bullets2:
        p = c2_tf.add_paragraph()
        p.text = f"• {b}"
        p.font.size = Pt(11)
        p.font.color.rgb = SLATE_DARK

    # Bottom Highlight Card: Why is it important/interesting?
    c3 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.8), Inches(11.7), Inches(1.8))
    c3.fill.solid()
    c3.fill.fore_color.rgb = CARD_BG
    c3.line.color.rgb = PRIMARY_EMERALD
    c3_tf = c3.text_frame
    c3_tf.word_wrap = True
    p = c3_tf.paragraphs[0]
    p.text = "💡 Why Is This Problem Important & Interesting to Solve as Software Engineers?"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_EMERALD

    p = c3_tf.add_paragraph()
    p.text = (
        "This is NOT a food shortage problem; it is a real-time micro-logistics and coordination breakdown. "
        "The food already exists, and the hungry beneficiaries are located only 2 to 3 kilometers away. "
        "By building an intelligent, real-time digital system, we can bridge this exact 4-hour gap and turn wasted food into immediate social relief."
    )
    p.font.size = Pt(11.5)
    p.font.color.rgb = SLATE_DARK

    s2.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "Moving to Section 1: Problem Identification. In simple terms, Dhaka produces enough surplus food daily in "
        "university cafeterias, convention halls, and restaurants to feed tens of thousands. However, cooked food has a strict "
        "4-hour biological lifespan. After 4 hours at room temperature, bacterial growth renders it unsafe. Traditional charity "
        "relies on slow phone calls, by which time the food spoils. As software engineers, this is an exciting problem because it's "
        "purely a real-time routing and coordination challenge."
    )

    # ==========================================
    # SLIDE 3: EVIDENCE & DATA
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Section 1", "1. Evidence & Data: Backed by Research & Real-World Impact",
               "Quantifiable facts, authoritative reports, and societal benefits")
    add_footer(s3, 3)

    # 4 Stat Boxes
    stats = [
        ("10.7M Tons", "Food Wasted Annually", "UNEP Food Waste Index (BD)", ROSE_RED, ROSE_BG),
        ("4 Hours", "Biological Safety Window", "BFSA Thermal Danger Zone", AMBER_ORANGE, AMBER_BG),
        ("3.8M People", "Urban Food-Insecure", "BBS/World Bank Slum Data", BLUE_COLOR, BLUE_BG),
        ("0% Audit Trail", "No Digital CSR Today", "Lack of Transparent Verification", PRIMARY_EMERALD, RGBColor(236, 253, 245))
    ]

    left_pos = 0.8
    for val, lbl, sub, col, bg_col in stats:
        sb = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left_pos), Inches(1.8), Inches(2.75), Inches(1.7))
        sb.fill.solid()
        sb.fill.fore_color.rgb = bg_col
        sb.line.color.rgb = col
        tf = sb.text_frame
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
        p.font.size = Pt(9.5)
        p.font.color.rgb = SLATE_MUTED
        p.alignment = PP_ALIGN.CENTER

        left_pos += 2.98

    # 2 Impact Cards
    imp1 = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.8), Inches(5.7), Inches(2.8))
    imp1.fill.solid()
    imp1.fill.fore_color.rgb = BLUE_BG
    imp1.line.color.rgb = BLUE_COLOR
    tf1 = imp1.text_frame
    tf1.word_wrap = True
    p = tf1.paragraphs[0]
    p.text = "🌍 Real-World Social & Healthcare Impact"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = BLUE_COLOR

    points_imp1 = [
        "Zero Hunger (UN SDG 2): Direct, dignity-preserved nutritional supply for orphanages, street children, and shelter homes.",
        "Food Safety & Health: Enforces strict thermal holding standards (>65°C hot, <4°C chilled), preventing foodborne illnesses.",
        "CSR Recognition: Empowers corporate cafeterias and caterers with auditable digital certificates of their social contributions."
    ]
    for pt in points_imp1:
        p = tf1.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = SLATE_DARK

    imp2 = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(3.8), Inches(5.7), Inches(2.8))
    imp2.fill.solid()
    imp2.fill.fore_color.rgb = RGBColor(236, 253, 245)
    imp2.line.color.rgb = PRIMARY_EMERALD
    tf2 = imp2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "🌱 Environmental & Economic Impact"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_EMERALD

    points_imp2 = [
        "Methane & Greenhouse Gas Abatement: Decomposing food in open landfills is one of the top causes of urban greenhouse gas emissions. Rescuing food directly stops this cycle.",
        "Agricultural Water Conservation: Preserves thousands of liters of embedded water used during food cultivation.",
        "Economic Efficiency: Eliminates disposal and incineration costs for large catering operations."
    ]
    for pt in points_imp2:
        p = tf2.add_paragraph()
        p.text = f"• {pt}"
        p.font.size = Pt(11)
        p.font.color.rgb = SLATE_DARK

    s3.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "Here is the evidence and research backing our project: The UNEP Food Waste Index reports that Bangladesh wastes "
        "10.7 million metric tons of food each year. In Dhaka alone, 3.8 million people face caloric deficit. In terms of "
        "real-world impact, ShareBite BD directly targets UN SDG 2 (Zero Hunger) and SDG 12 (Responsible Consumption). "
        "Furthermore, by preventing food from rotting in landfills, we eliminate potent methane emissions."
    )

    # ==========================================
    # SLIDE 4: SOLUTION (THE IDEA & APPROACH)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Section 2", "2. Solution: The Core Idea & System Approach",
               "A synchronized 3-sided micro-logistics platform engineered for 15–30 minute rescue velocity")
    add_footer(s4, 4)

    # The ONE SINGLE LINE Box
    hero_box = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(1.5))
    hero_box.fill.solid()
    hero_box.fill.fore_color.rgb = DARK_BG
    hero_box.line.color.rgb = ACCENT_MINT
    h_tf = hero_box.text_frame
    h_tf.word_wrap = True

    p = h_tf.paragraphs[0]
    p.text = "🌟 ONE SINGLE LINE (Explainable to a kid or parent):"
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = ACCENT_MINT

    p = h_tf.add_paragraph()
    p.text = '"An Uber-like app where university cafeterias post extra hot food, and nearby orphanages and student volunteers get alerted to pick it up and feed hungry people before it gets cold and goes bad!"'
    p.font.size = Pt(16.5)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)

    # 3-Sided Ecosystem
    sec_lbl = s4.shapes.add_textbox(Inches(0.8), Inches(3.4), Inches(11.7), Inches(0.4))
    sec_p = sec_lbl.text_frame.paragraphs[0]
    sec_p.text = "What Will the System Do? (The 3-Sided Hyper-Local Ecosystem):"
    sec_p.font.size = Pt(13.5)
    sec_p.font.bold = True
    sec_p.font.color.rgb = SLATE_DARK

    eco_cards = [
        ("🍲 1. Food Donors", "Cafeterias, Caterers & Restaurants", 
         "Post surplus food in under 60 seconds with live photo upload, cooking time, and automated food safety countdown declaration.", PRIMARY_EMERALD, CARD_BG),
        ("🏢 2. Verified NGOs", "Charities, Orphanages & Shelters", 
         "Browse available food lots on a live radar map (3–5 km radius), evaluate biological freshness, and claim items in a single click.", BLUE_COLOR, BLUE_BG),
        ("🚴 3. Volunteer Squad", "Student Cyclists & Motorcycle Riders", 
         "Receive instant Uber-style dispatch notifications on their daily commute, complete rapid pickups using insulated thermal carriers.", AMBER_ORANGE, AMBER_BG)
    ]

    left = 0.8
    for title, subtitle, desc, col, bg_col in eco_cards:
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(3.9), Inches(3.7), Inches(2.7))
        c.fill.solid()
        c.fill.fore_color.rgb = bg_col
        c.line.color.rgb = col
        tf = c.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = subtitle
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = SLATE_MUTED

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = SLATE_DARK

        left += 4.0

    s4.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "In Section 2, our guideline requires a single line to explain the project to a kid or parent. "
        "Here it is: 'An Uber-like app where university cafeterias post extra hot food, and nearby orphanages and student volunteers "
        "get alerted to pick it up and feed hungry people before it gets cold and goes bad!' "
        "To achieve this, ShareBite BD synchronizes three parties: Food Donors who post in 60 seconds, Verified NGOs who claim on a radar map, "
        "and Campus Student Volunteers who complete the rescue in 15 to 30 minutes."
    )

    # ==========================================
    # SLIDE 5: MAIN FEATURES & OUTPUTS
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Section 2", "2. Main Features: What Will the End System Perform?",
               "Idea-driven core features engineered to solve real-world logistical friction")
    add_footer(s5, 5)

    feat_grid = [
        ("⚡ 1. 60-Sec Listing & AI Spoilage Meter", 
         "Donors simply enter food type and cooking time. A live dynamic speedometer gauge calculates remaining safe consumption hours (>65°C safe holding). Automatically converts raw weight into child meals (e.g., '40 kg Biryani = 80–100 meals').", 
         PRIMARY_EMERALD, RGBColor(236, 253, 245)),
        
        ("📍 2. Proximity Radar Map & Smart Filtering", 
         "To bypass Dhaka traffic, NGOs filter donations strictly within 3 km or 5 km. Batches with under 2 hours remaining are automatically highlighted as '🚨 Urgent Rescues' with high-priority audio-visual push notifications.", 
         BLUE_COLOR, BLUE_BG),
        
        ("🚴 3. Uber-Style Volunteer Dispatch & Routing", 
         "Crowdsources campus student cyclists and bikers during their commutes. Provides turn-by-turn routing to the donor's service entrance, hygiene carrier check, and real-time live GPS tracking to the shelter.", 
         AMBER_ORANGE, AMBER_BG),
        
        ("🔒 4. 4-Digit OTP & QR Code Anti-Fraud Handover", 
         "Donors release food only after matching the volunteer's secret 4-digit PIN (e.g. 7429). The destination shelter scans a cryptographically hashed QR code upon arrival. Guarantees zero theft, zero resale, and 100% audit transparency.", 
         PURPLE_COLOR, PURPLE_BG)
    ]

    positions = [
        (Inches(0.8), Inches(1.8)),
        (Inches(6.8), Inches(1.8)),
        (Inches(0.8), Inches(4.3)),
        (Inches(6.8), Inches(4.3))
    ]

    for (title, desc, col, bg_col), (x, y) in zip(feat_grid, positions):
        fc = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.7), Inches(2.3))
        fc.fill.solid()
        fc.fill.fore_color.rgb = bg_col
        fc.line.color.rgb = col
        tf = fc.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13.5)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = SLATE_DARK

    s5.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "Here are the 4 main outputs the system will perform: "
        "First, 60-Second Food Listing with our AI Spoilage & Safety Meter that gives donors an animated countdown timer and meal converter. "
        "Second, a Radar Map with 3 to 5 km proximity radius so food never gets stuck in Dhaka traffic. "
        "Third, an Uber-style student volunteer dispatch network. "
        "And fourth, an anti-fraud two-step verification using a 4-digit PIN and dynamic QR code so food cannot be diverted or stolen."
    )

    # ==========================================
    # SLIDE 6: PLAN OF ACTION (TECH OVERVIEW)
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Section 3", "3. Plan of Action: High-Level Technology Overview",
               "Modern, production-grade open-source stack selected for velocity, type-safety, and zero hosting cost")
    add_footer(s6, 6)

    tech_cards = [
        ("💻 Frontend Framework", "Next.js 16 + React 19 + Tailwind CSS v4", 
         "Why: Server Components deliver sub-100ms load times and seamless mobile responsiveness on standard smartphone browsers without the friction of installing a native app.", 
         PRIMARY_EMERALD),
        ("🗄️ Backend & Database", "Prisma ORM + PostgreSQL + Zod Validation", 
         "Why: Strongly-typed relational data models for Users, Role Profiles, Donations, Claims, and Delivery Receipts with atomic state transitions and strict input sanitization.", 
         BLUE_COLOR),
        ("🗺️ Geospatial Maps & Realtime", "Leaflet.js + OpenStreetMap", 
         "Why: 100% free and open-source geospatial mapping and Haversine distance calculations without requiring expensive Google Maps API credit card billing.", 
         AMBER_ORANGE)
    ]

    left = 0.8
    for title, subtitle, why, col in tech_cards:
        tc = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(1.8), Inches(3.7), Inches(2.7))
        tc.fill.solid()
        tc.fill.fore_color.rgb = CARD_BG
        tc.line.color.rgb = col
        tf = tc.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13.5)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = subtitle
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = SLATE_DARK

        p = tf.add_paragraph()
        p.text = why
        p.font.size = Pt(10.5)
        p.font.color.rgb = SLATE_MUTED

        left += 4.0

    # Feature-wise Implementation Table
    ft = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.7), Inches(11.7), Inches(2.0))
    ft.fill.solid()
    ft.fill.fore_color.rgb = RGBColor(236, 253, 245)
    ft.line.color.rgb = PRIMARY_EMERALD
    ft_tf = ft.text_frame
    ft_tf.word_wrap = True

    p = ft_tf.paragraphs[0]
    p.text = "🛠️ Feature-Wise Technology Plan (High-Level Architecture):"
    p.font.size = Pt(12.5)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_EMERALD

    mappings = [
        "• Food Donor Portal: Next.js Form Engine + Real-time Countdown Timer Hook + BFSA Safety Declaration.",
        "• NGO Discovery Hub: Leaflet GIS Radar Canvas + Haversine 3-5 km Spatial Radius Filter + One-Click Claim Locking.",
        "• Volunteer Dispatch: Real-time Status Transitions (Available → Reserved → Picked Up → Delivered).",
        "• Verification Engine: Role-Based Access Control (RBAC) + SHA-256 Hashed 4-Digit OTP + Dynamic QR Tokens."
    ]
    for m in mappings:
        p = ft_tf.add_paragraph()
        p.text = m
        p.font.size = Pt(10.5)
        p.font.color.rgb = SLATE_DARK

    s6.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "Section 3 covers our Plan of Action. We have deliberately chosen a modern, industry-standard stack: "
        "Next.js 16 with React 19 for mobile-first speed, Prisma ORM with PostgreSQL for robust relational data integrity, "
        "and Leaflet with OpenStreetMap for 100% free geospatial routing. This architecture requires zero infrastructure budget, "
        "allowing us to deploy freely on student tiers like Vercel and Supabase while maintaining enterprise-grade type safety."
    )

    # ==========================================
    # SLIDE 7: TIMELINE & CONCLUSION
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Section 4", "4. Project Timeline: 16-Week Implementation Roadmap",
               "Structured semester milestones leading to a live campus pilot and defense readiness")
    add_footer(s7, 7)

    sprints = [
        ("Weeks 1 – 4", "Sprint 1: Architecture & UI/UX", 
         ["Software Requirements (SRS)", "Prisma Database Schema", "Responsive 3-Portal UI Shells", "RBAC Authentication"], 
         PRIMARY_EMERALD),
        
        ("Weeks 5 – 8", "Sprint 2: Core Rescue Engine", 
         ["AI Spoilage Countdown Engine", "Leaflet Radar GIS Mapping", "4-Digit OTP & QR Protocols", "Claim State Transactions"], 
         BLUE_COLOR),
        
        ("Weeks 9 – 12", "Sprint 3: Campus Live Pilot", 
         ["UIU Cafeteria Live Integration", "Badda Local Eatery Trial", "Student Volunteer Dispatch Runs", "Mastul Foundation Delivery"], 
         AMBER_ORANGE),
        
        ("Weeks 13 – 16", "Sprint 4: Audit & Defense", 
         ["End-to-End System Testing", "CSR Impact Analytics Engine", "Security & Load Testing", "Project Defense Presentation"], 
         PURPLE_COLOR)
    ]

    left = 0.8
    for wks, name, items, col in sprints:
        sc = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(1.8), Inches(2.75), Inches(2.9))
        sc.fill.solid()
        sc.fill.fore_color.rgb = CARD_BG
        sc.line.color.rgb = col
        tf = sc.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = wks.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = name
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = SLATE_DARK

        for it in items:
            p = tf.add_paragraph()
            p.text = f"• {it}"
            p.font.size = Pt(10)
            p.font.color.rgb = SLATE_MUTED

        left += 2.98

    # Final Commitment Box
    fin = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.9), Inches(11.7), Inches(1.8))
    fin.fill.solid()
    fin.fill.fore_color.rgb = RGBColor(236, 253, 245)
    fin.line.color.rgb = PRIMARY_EMERALD
    fin_tf = fin.text_frame
    fin_tf.word_wrap = True

    p = fin_tf.paragraphs[0]
    p.text = "🚀 Summary & Conclusion: Ready for Execution & Measurable Social Good"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_EMERALD

    p = fin_tf.add_paragraph()
    p.text = (
        "ShareBite BD addresses a critical real-world problem with modern software engineering. "
        "With a zero-cost infrastructure plan, an authentic campus pilot at UIU, and strict food safety compliance, "
        "our team is fully prepared to deliver a high-scoring, impactful final project. Thank you! We welcome your questions. 🤝"
    )
    p.font.size = Pt(11)
    p.font.color.rgb = SLATE_DARK

    s7.notes_slide.notes_text_frame.text = (
        "SPEAKER NOTES (1.5 Min):\n"
        "To conclude, our timeline is structured across 16 weeks into 4 agile sprints. The standout highlight of our plan is Sprint 3, "
        "where we conduct an authentic live campus pilot at UIU Central Cafeteria and Badda restaurants with student volunteers. "
        "This proves real-world utility before our final defense. Thank you faculty and fellow students for your time. "
        "We are now ready for your questions!"
    )

    # Save PPTX
    out_path = os.path.join(os.getcwd(), "ShareBite_BD_SE_Lab_Presentation.pptx")
    prs.save(out_path)
    print(f"SUCCESS: Native PPTX generated ({os.path.getsize(out_path) / 1024:.1f} KB) at: {out_path}")

if __name__ == "__main__":
    create_presentation()
