# -*- coding: utf-8 -*-
"""
ShareBite BD - Clean, Academic, Professional PowerPoint Deck
Follows:
- Exact clean, structured style from user reference (numbered modules, crisp cards, clean typography)
- SE Lab Project Proposal Guideline (4 mandatory sections)
- 16:9 Widescreen (13.333" x 7.5")
- High contrast, light clean background for 100% projector readability
- 10-Minute English speaker notes on all 7 slides
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

    # Color Palette: Clean Academic Modern Theme
    BG_WHITE = RGBColor(255, 255, 255)
    BG_LIGHT = RGBColor(248, 250, 252)       # Slate 50
    CARD_BG = RGBColor(255, 255, 255)        # Pure White
    CARD_BORDER = RGBColor(226, 232, 240)    # Slate 200
    
    PRIMARY_EMERALD = RGBColor(5, 150, 105)  # Emerald 600
    EMERALD_DARK = RGBColor(6, 78, 59)       # Emerald 900
    EMERALD_LIGHT = RGBColor(236, 253, 245)  # Emerald 50
    
    SLATE_900 = RGBColor(15, 23, 42)         # Primary Dark Text
    SLATE_700 = RGBColor(51, 65, 85)         # Body Text
    SLATE_500 = RGBColor(100, 116, 139)      # Muted/Subtitles
    SLATE_300 = RGBColor(203, 213, 225)      # Light Borders

    ACCENT_BLUE = RGBColor(2, 132, 199)      # Sky 600
    BLUE_LIGHT = RGBColor(240, 249, 255)     # Sky 50
    ACCENT_AMBER = RGBColor(217, 119, 6)     # Amber 600
    AMBER_LIGHT = RGBColor(254, 243, 199)    # Amber 50
    ACCENT_ROSE = RGBColor(225, 29, 72)      # Rose 600
    ROSE_LIGHT = RGBColor(255, 241, 242)     # Rose 50
    ACCENT_PURPLE = RGBColor(124, 58, 237)   # Purple 600
    PURPLE_LIGHT = RGBColor(245, 243, 255)   # Purple 50

    base_dir = os.getcwd()

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_LIGHT
        bg.line.fill.background()
        return bg

    def add_header(slide, tag_text, title_text, subtitle_text=""):
        # Top Category / Section Pill
        tag_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.35), Inches(3.4), Inches(0.32))
        tag_box.fill.solid()
        tag_box.fill.fore_color.rgb = EMERALD_LIGHT
        tag_box.line.color.rgb = PRIMARY_EMERALD
        t_tf = tag_box.text_frame
        t_tf.word_wrap = True
        p_tag = t_tf.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.font.size = Pt(9.5)
        p_tag.font.bold = True
        p_tag.font.color.rgb = PRIMARY_EMERALD
        p_tag.alignment = PP_ALIGN.CENTER

        # Slide Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.70), Inches(11.733), Inches(0.55))
        tf_t = t_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = SLATE_900

        # Subtitle
        if subtitle_text:
            s_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.22), Inches(11.733), Inches(0.35))
            tf_s = s_box.text_frame
            tf_s.word_wrap = True
            p_s = tf_s.paragraphs[0]
            p_s.text = subtitle_text
            p_s.font.size = Pt(11)
            p_s.font.color.rgb = SLATE_500

    def add_footer(slide, slide_num):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.92), Inches(11.733), Inches(0.35))
        tf = footer_box.text_frame
        p = tf.paragraphs[0]
        p.text = f"ShareBite BD  —  Software Engineering Lab Project Proposal Deck                                                           Slide {slide_num} / 7"
        p.font.size = Pt(9.5)
        p.font.color.rgb = SLATE_500

    # ==========================================
    # SLIDE 1: TITLE SLIDE (CLEAN ACADEMIC)
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Top Tag
    t1_tag = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(4.2), Inches(0.38))
    t1_tag.fill.solid()
    t1_tag.fill.fore_color.rgb = EMERALD_LIGHT
    t1_tag.line.color.rgb = PRIMARY_EMERALD
    p_t1 = t1_tag.text_frame.paragraphs[0]
    p_t1.text = "CSE LAB • 10-MINUTE PROJECT PROPOSAL"
    p_t1.font.size = Pt(10)
    p_t1.font.bold = True
    p_t1.font.color.rgb = PRIMARY_EMERALD
    p_t1.alignment = PP_ALIGN.CENTER

    # Title & Subtitle Box
    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(11.7), Inches(1.6))
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "ShareBite BD"
    p1.font.size = Pt(46)
    p1.font.bold = True
    p1.font.color.rgb = EMERALD_DARK

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "Hyper-Local Surplus Food Rescue & Safety-Compliant Redistribution Network"
    p1_sub.font.size = Pt(18)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = SLATE_700

    # Badges Row
    badges_data = [
        ("🎯 UN SDG 2: Zero Hunger", PRIMARY_EMERALD, EMERALD_LIGHT),
        ("🌱 UN SDG 12: Responsible Consumption", PRIMARY_EMERALD, EMERALD_LIGHT),
        ("⚡ 15–30 Min Rescue Velocity", ACCENT_BLUE, BLUE_LIGHT)
    ]
    for idx, (b_txt, b_border, b_fill) in enumerate(badges_data):
        b_shp = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 3.95), Inches(3.2), Inches(3.8), Inches(0.42))
        b_shp.fill.solid()
        b_shp.fill.fore_color.rgb = b_fill
        b_shp.line.color.rgb = b_border
        p = b_shp.text_frame.paragraphs[0]
        p.text = b_txt
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = b_border
        p.alignment = PP_ALIGN.CENTER

    # 3 Structured Overview Cards (Numbered 01, 02, 03)
    cards_data = [
        ("01", "TARGET ECOSYSTEM", 
         "Focused Campus Pilot:\n• UIU Central Cafeteria\n• Dhanmondi / Badda Caterers\n• Local Orphanages & Shelters", 
         PRIMARY_EMERALD),
        ("02", "CORE SOFTWARE GOAL", 
         "Eliminate Food Spoilage:\n• Sub-60s rapid listing\n• 3–5 km proximity radar GIS\n• 4-Digit OTP handshake delivery", 
         ACCENT_BLUE),
        ("03", "ACADEMIC SCOPE", 
         "16-Week SE Implementation:\n• Next.js 16 & Prisma ORM\n• PostgreSQL ACID state locks\n• Leaflet GIS without paid APIs", 
         ACCENT_PURPLE)
    ]
    for idx, (num, h_text, b_text, accent) in enumerate(cards_data):
        card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 4.0), Inches(3.9), Inches(3.733), Inches(2.7))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.word_wrap = True
        
        # Number Pill
        pn = ctf.paragraphs[0]
        pn.text = num
        pn.font.size = Pt(16)
        pn.font.bold = True
        pn.font.color.rgb = accent

        ph = ctf.add_paragraph()
        ph.text = h_text
        ph.font.size = Pt(12)
        ph.font.bold = True
        ph.font.color.rgb = SLATE_900

        pb = ctf.add_paragraph()
        pb.text = b_text
        pb.font.size = Pt(11)
        pb.font.color.rgb = SLATE_700

    add_footer(s1, 1)
    s1.notes_slide.notes_text_frame.text = (
        "Good day respected faculty and peers. Welcome to our Software Engineering Lab Project Proposal "
        "presentation on 'ShareBite BD'. ShareBite BD is a hyper-local surplus food rescue platform designed "
        "to connect university cafeterias, verified NGOs, and student volunteers to redistribute extra cooked food "
        "within a strict 15 to 30-minute safety window."
    )

    # ==========================================
    # SLIDE 2: PROBLEM IDENTIFICATION
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Problem Statement", 
               "1. Problem Identification: What Problem Are We Solving?", 
               "The critical paradox of urban food waste vs. street hunger in Dhaka City")

    # Left Card: Core Context & Diagnosis
    left_card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(4.5), Inches(4.2))
    left_card.fill.solid()
    left_card.fill.fore_color.rgb = CARD_BG
    left_card.line.color.rgb = PRIMARY_EMERALD
    ltf = left_card.text_frame
    ltf.word_wrap = True
    
    lp1 = ltf.paragraphs[0]
    lp1.text = "CORE DIAGNOSIS"
    lp1.font.size = Pt(11)
    lp1.font.bold = True
    lp1.font.color.rgb = PRIMARY_EMERALD

    lp2 = ltf.add_paragraph()
    lp2.text = "Why Does Good Food Go to Waste?"
    lp2.font.size = Pt(16)
    lp2.font.bold = True
    lp2.font.color.rgb = SLATE_900

    lp3 = ltf.add_paragraph()
    lp3.text = (
        "\nIn Dhaka, food waste is NOT caused by food shortage.\n\n"
        "It is fundamentally an INFORMATION, COORDINATION, and MICRO-LOGISTICS failure.\n\n"
        "Large institutional kitchens prepare food in bulk. When extra trays remain at night, "
        "the donors have no rapid, verified channel to reach hungry communities before spoilage occurs."
    )
    lp3.font.size = Pt(11.5)
    lp3.font.color.rgb = SLATE_700

    # Right Column: 3 Numbered Problem Drivers (01, 02, 03)
    p_drivers = [
        ("01", "THE DAILY MIDNIGHT FOOD DUMP", 
         "University cafeterias (e.g. UIU Central Cafeteria), event caterers, and eateries discard 40–80 kg of untouched hot meals every night into municipal dumpsters due to zero instant charity links.", 
         ACCENT_ROSE),
        ("02", "THE 4-HOUR BIOLOGICAL SAFETY CLOCK", 
         "Cooked food enters the bacterial danger zone (5°C–60°C). Under Bangladesh Food Safety Authority (BFSA) guidelines, cooked meals must be eaten within 4 hours. Manual coordination takes 5+ hours.", 
         ACCENT_AMBER),
        ("03", "THE MISSING MICRO-LOGISTICS LINK", 
         "Nearby orphanages and shelters lack vehicles or night staff. Food is available just 2 km away, but there is zero automated courier dispatch system to transport it in time.", 
         ACCENT_BLUE)
    ]
    for idx, (num, title, desc, col) in enumerate(p_drivers):
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.6), Inches(1.65 + idx * 1.45), Inches(6.933), Inches(1.35))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.word_wrap = True
        
        pt = ctf.paragraphs[0]
        run_n = pt.add_run()
        run_n.text = f"{num}  "
        run_n.font.bold = True
        run_n.font.size = Pt(13)
        run_n.font.color.rgb = col
        
        run_t = pt.add_run()
        run_t.text = title
        run_t.font.bold = True
        run_t.font.size = Pt(12)
        run_t.font.color.rgb = SLATE_900

        pd = ctf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = SLATE_700

    # Bottom Takeaway Pill
    bot_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.05), Inches(11.733), Inches(0.65))
    bot_box.fill.solid()
    bot_box.fill.fore_color.rgb = EMERALD_LIGHT
    bot_box.line.color.rgb = PRIMARY_EMERALD
    btf = bot_box.text_frame
    btf.word_wrap = True
    bp = btf.paragraphs[0]
    bp.text = "KEY TAKEAWAY: Food surplus and severe hunger exist within 3 km of each other, but lack an automated software platform to bridge the 4-hour safety window."
    bp.font.size = Pt(11)
    bp.font.bold = True
    bp.font.color.rgb = EMERALD_DARK
    bp.alignment = PP_ALIGN.CENTER

    add_footer(s2, 2)
    s2.notes_slide.notes_text_frame.text = (
        "In Slide 2, we define the problem. The core issue in Dhaka is not food scarcity, but a complete "
        "coordination breakdown. Cafeterias at universities like UIU cook in large batches and dump 40-80kg of "
        "fresh biryani nightly. They cannot donate because cooked food spoils after 4 hours under BFSA guidelines, "
        "and shelters have no transport at 10 PM. ShareBite BD solves this exact logistics bottleneck."
    )

    # ==========================================
    # SLIDE 3: EVIDENCE & DATA (BACKED BY STATS)
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Evidence & Real-World Impact", 
               "1. Evidence & Data: Backed by Hard Statistics", 
               "Authoritative research on food waste, biological danger limits, and urban food insecurity")

    # 4 Large KPI Metric Cards Across Top
    kpis = [
        ("10.7M Tons", "ANNUAL FOOD WASTE", "UNEP Food Waste Index 2024 (BD)", ACCENT_ROSE),
        ("4 Hours", "BIOLOGICAL SAFETY LIMIT", "BFSA Danger Zone (5°C – 60°C)", ACCENT_AMBER),
        ("3.8 Million", "URBAN FOOD-INSECURE", "BBS & World Bank Slum Report", ACCENT_BLUE),
        ("0% Digital", "CAMPUS TRACEABILITY TODAY", "Zero Audit Trail or Safety Records", PRIMARY_EMERALD)
    ]
    for idx, (num, label, sub, col) in enumerate(kpis):
        box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 2.98), Inches(1.65), Inches(2.8), Inches(1.5))
        box.fill.solid()
        box.fill.fore_color.rgb = CARD_BG
        box.line.color.rgb = CARD_BORDER
        btf = box.text_frame
        btf.word_wrap = True
        
        pn = btf.paragraphs[0]
        pn.text = num
        pn.font.size = Pt(24)
        pn.font.bold = True
        pn.font.color.rgb = col
        pn.alignment = PP_ALIGN.CENTER

        pl = btf.add_paragraph()
        pl.text = label
        pl.font.size = Pt(10)
        pl.font.bold = True
        pl.font.color.rgb = SLATE_900
        pl.alignment = PP_ALIGN.CENTER

        ps = btf.add_paragraph()
        ps.text = sub
        ps.font.size = Pt(8.5)
        ps.font.color.rgb = SLATE_500
        ps.alignment = PP_ALIGN.CENTER

    # Bottom: 3 Core Real-World Impact Takeaway Cards (Numbered 01, 02, 03)
    impacts = [
        ("01", "SOCIAL IMPACT: ZERO HUNGER (SDG 2)", 
         "Directly feeds destitute children, orphanages, and street laborers with preserved human dignity. Rescuing a single 40 kg batch feeds 80–100 hungry people every night.", 
         PRIMARY_EMERALD),
        ("02", "HEALTH & SAFETY: BFSA COMPLIANCE", 
         "Enforces mandatory digital timestamping and temperature monitoring. Food exceeding the 4-hour threshold is automatically locked out, completely eliminating food poisoning risks.", 
         ACCENT_BLUE),
        ("03", "ENVIRONMENT: METHANE PREVENTION (SDG 12)", 
         "Diverts tons of decomposing organic food from open city landfills in Aminbazar and Matuail, slashing lethal greenhouse gas emissions and urban environmental decay.", 
         ACCENT_PURPLE)
    ]
    for idx, (num, title, desc, col) in enumerate(impacts):
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 4.0), Inches(3.35), Inches(3.733), Inches(3.2))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.word_wrap = True
        
        pn = ctf.paragraphs[0]
        pn.text = num
        pn.font.size = Pt(18)
        pn.font.bold = True
        pn.font.color.rgb = col

        pt = ctf.add_paragraph()
        pt.text = title
        pt.font.size = Pt(11.5)
        pt.font.bold = True
        pt.font.color.rgb = SLATE_900

        pd = ctf.add_paragraph()
        pd.text = f"\n{desc}"
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = SLATE_700

    add_footer(s3, 3)
    s3.notes_slide.notes_text_frame.text = (
        "In Slide 3, we ground our project in authoritative empirical data. According to the UNEP Food Waste "
        "Index 2024, Bangladesh wastes 10.7 million tons of food annually. At the same time, 3.8 million urban "
        "residents face food insecurity. Food safety guidelines from BFSA dictate that cooked food has a strict "
        "4-hour window before entering the bacterial danger zone. ShareBite BD satisfies UN SDG 2 (Zero Hunger) "
        "and SDG 12 (Responsible Consumption) through automated timestamp enforcement."
    )

    # ==========================================
    # SLIDE 4: SOLUTION (THE CORE IDEA & 3-SIDED ECOSYSTEM)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Solution Architecture", 
               "2. Solution: The Core Idea & 3-Sided Ecosystem", 
               "A synchronized hyper-local network engineered for 15–30 minute rescue turnaround")

    # Top Mandatory Guideline One-Liner Box
    one_liner = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(11.733), Inches(1.4))
    one_liner.fill.solid()
    one_liner.fill.fore_color.rgb = EMERALD_LIGHT
    one_liner.line.color.rgb = PRIMARY_EMERALD
    otf = one_liner.text_frame
    otf.word_wrap = True
    
    op_tag = otf.paragraphs[0]
    op_tag.text = "ONE SINGLE LINE (Explaining the project to a kid or parent):"
    op_tag.font.size = Pt(10)
    op_tag.font.bold = True
    op_tag.font.color.rgb = PRIMARY_EMERALD

    op_main = otf.add_paragraph()
    op_main.text = '"An Uber-like platform where university cafeterias post extra hot food, and student volunteers bike it to nearby orphanages in 30 minutes before it spoils!"'
    op_main.font.size = Pt(15.5)
    op_main.font.bold = True
    op_main.font.color.rgb = EMERALD_DARK

    # Bottom: 3-Sided Ecosystem Pillar Cards (Numbered 01, 02, 03)
    pillars = [
        ("01", "FOOD DONORS", "Cafeterias, Caterers & Restaurants", 
         "• 60-Second Posting: Quick 3-field listing form\n• AI Spoilage Gauge: Visual countdown dial based on cook time\n• Meal Converter: Converts kilograms to servings ('40kg = 80 meals')", 
         PRIMARY_EMERALD),
        ("02", "VERIFIED NGOS", "Orphanages & Local Shelters", 
         "• Proximity Radar Map: Real-time map filtered to 3–5 km\n• 1-Click Claim Engine: Instantly reserves batch to prevent double-claiming\n• Digital CSR Receipts: Automated audit reports for donors", 
         ACCENT_BLUE),
        ("03", "STUDENT VOLUNTEERS", "Campus Cyclists & Bikers Squad", 
         "• Uber-Style Push Alerts: Students notified along daily commutes\n• 15–30 Min Velocity: Fast delivery before food gets cold\n• Thermal Bag Check: Ensures hygienic insulated carrier compliance", 
         ACCENT_AMBER)
    ]
    for idx, (num, title, role, desc, col) in enumerate(pillars):
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 4.0), Inches(3.25), Inches(3.733), Inches(3.35))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.word_wrap = True
        
        pn = ctf.paragraphs[0]
        pn.text = num
        pn.font.size = Pt(18)
        pn.font.bold = True
        pn.font.color.rgb = col

        pt = ctf.add_paragraph()
        pt.text = title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = SLATE_900

        pr = ctf.add_paragraph()
        pr.text = role
        pr.font.size = Pt(10)
        pr.font.bold = True
        pr.font.color.rgb = SLATE_500

        pd = ctf.add_paragraph()
        pd.text = f"\n{desc}"
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = SLATE_700

    add_footer(s4, 4)
    s4.notes_slide.notes_text_frame.text = (
        "In Slide 4, per the proposal guidelines, we articulate our core solution in one single line that a "
        "child or parent can understand immediately: ShareBite BD is an Uber-like platform where cafeterias post "
        "extra hot food, and student volunteers deliver it to hungry children in 30 minutes before spoilage. "
        "Our 3-sided ecosystem coordinates Donors, NGOs, and Student Volunteers seamlessly."
    )

    # ==========================================
    # SLIDE 5: MAIN FEATURES & OUTPUTS
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Core Functionalities", 
               "2. Main Features: What Will the End System Perform?", 
               "Four engineered modules eliminating the primary failure points in food rescue")

    # 4 Grid Feature Cards (Numbered 01, 02, 03, 04)
    features_data = [
        ("01", "AI SPOILAGE METER & TIMEOUT LOCK", 
         "Input: Cooking timestamp & storage type.\nMechanism: Dynamic biological decay countdown enforcing the BFSA 4-hour window.\nOutput: Real-time visual dial; automatically de-lists batches when time runs out to ensure 100% food safety.", 
         PRIMARY_EMERALD),
        ("02", "3–5 KM HYPER-LOCAL RADAR MAP", 
         "Input: GPS coordinates of donors and recipient shelters.\nMechanism: Client-side Haversine circular radius queries on OpenStreetMap.\nOutput: Eliminates Dhaka traffic gridlock by strictly matching donations within a 15-minute cycling/walking radius.", 
         ACCENT_BLUE),
        ("03", "UBER-STYLE VOLUNTEER DISPATCH", 
         "Input: Active verified claims & volunteer locations.\nMechanism: Instant broadcast push alerts to registered student cyclists/bikers.\nOutput: Provides turn-by-turn route directions, donor contact, pickup deadline, and thermal bag checklist.", 
         ACCENT_AMBER),
        ("04", "4-DIGIT OTP & QR ANTI-FRAUD PROTOCOL", 
         "Input: Donor secret PIN & NGO receipt token.\nMechanism: Dual-layer cryptographic handshake at pickup and drop-off.\nOutput: Eliminates food diversion or black-market resale; guarantees food reaches intended children with 100% audit trail.", 
         ACCENT_PURPLE)
    ]
    for idx, (num, title, desc, col) in enumerate(features_data):
        row = idx // 2
        col_idx = idx % 2
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, 
                                   Inches(0.8 + col_idx * 5.95), 
                                   Inches(1.65 + row * 2.15), 
                                   Inches(5.78), 
                                   Inches(2.0))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.word_wrap = True
        
        pt = ctf.paragraphs[0]
        run_n = pt.add_run()
        run_n.text = f"{num}  "
        run_n.font.bold = True
        run_n.font.size = Pt(14)
        run_n.font.color.rgb = col
        
        run_t = pt.add_run()
        run_t.text = title
        run_t.font.bold = True
        run_t.font.size = Pt(12)
        run_t.font.color.rgb = SLATE_900

        pd = ctf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(10)
        pd.font.color.rgb = SLATE_700

    # Process Flow Strip at Bottom
    proc_strip = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.05), Inches(11.733), Inches(0.65))
    proc_strip.fill.solid()
    proc_strip.fill.fore_color.rgb = BLUE_LIGHT
    proc_strip.line.color.rgb = ACCENT_BLUE
    ptf = proc_strip.text_frame
    ptf.word_wrap = True
    pp = ptf.paragraphs[0]
    pp.text = "PIPELINE: 60s Post ➔ AI Spoilage Verification ➔ 3km Radar Alert ➔ Student Biker Dispatch ➔ OTP Handshake Handover"
    pp.font.size = Pt(10.5)
    pp.font.bold = True
    pp.font.color.rgb = ACCENT_BLUE
    pp.alignment = PP_ALIGN.CENTER

    add_footer(s5, 5)
    s5.notes_slide.notes_text_frame.text = (
        "Slide 5 outlines the 4 concrete features of our system: first, the 60-second listing with an "
        "AI spoilage countdown meter; second, the 3 to 5 km proximity radar map to bypass Dhaka traffic; "
        "third, crowdsourced student volunteer dispatch; and fourth, a tamper-proof 4-digit OTP and QR code "
        "verification handshake that prevents theft and ensures the food actually feeds hungry children."
    )

    # ==========================================
    # SLIDE 6: PLAN OF ACTION (TECH OVERVIEW & RATIONALE)
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Technology & Architecture", 
               "3. Plan of Action: High-Level Technology Overview", 
               "Modern open-source stack chosen for rapid response time, relational integrity, and zero operating costs")

    # Architecture Pipeline Box Across Top
    pipe_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(11.733), Inches(1.4))
    pipe_box.fill.solid()
    pipe_box.fill.fore_color.rgb = CARD_BG
    pipe_box.line.color.rgb = PRIMARY_EMERALD
    ptf = pipe_box.text_frame
    ptf.word_wrap = True
    
    p_ph = ptf.paragraphs[0]
    p_ph.text = "SYSTEM ARCHITECTURE & DATA FLOW PIPELINE"
    p_ph.font.size = Pt(10.5)
    p_ph.font.bold = True
    p_ph.font.color.rgb = PRIMARY_EMERALD

    p_pb = ptf.add_paragraph()
    p_pb.text = "Donor Web Portal (Next.js 16 SSR) ➔ API Logic (TypeScript / Zod) ➔ Database Store (Prisma + PostgreSQL ACID) ➔ Geospatial Radar (Leaflet + Haversine 3km) ➔ Volunteer PWA (WebSockets & FCM) ➔ OTP Handshake"
    p_pb.font.size = Pt(11.5)
    p_pb.font.bold = True
    p_pb.font.color.rgb = SLATE_900

    # 3 Tech Selection Cards (Numbered 01, 02, 03 - With Clear Rationale)
    tech_cards = [
        ("01", "FRONTEND & PWA", "Next.js 16 + React 19 + Tailwind CSS", 
         "Role: Unified web portal and mobile PWA for all 3 user roles.\n\nWhy Chosen:\n• Sub-100ms cold start times on 4G mobile connections\n• Progressive Web App (PWA) eliminates app-store install barrier\n• Tailwind CSS v4 provides lightweight, responsive styling", 
         PRIMARY_EMERALD),
        ("02", "BACKEND & DATA", "Prisma ORM + PostgreSQL + TypeScript", 
         "Role: Data persistence, role authentication & claim state machine.\n\nWhy Chosen:\n• ACID transactions prevent race conditions (no double-claiming)\n• End-to-end type safety eliminates runtime schema errors\n• Relational integrity links Donors, NGOs, and Couriers", 
         ACCENT_BLUE),
        ("03", "GEOSPATIAL ENGINE", "Leaflet.js + OpenStreetMap (OSM)", 
         "Role: Interactive radar map, circular radius query & distance math.\n\nWhy Chosen:\n• 100% open-source without Google Maps billing/credit card limits\n• Fast client-side Haversine circular radius queries\n• Low memory footprint runs smoothly on student smartphones", 
         ACCENT_AMBER)
    ]
    for idx, (num, h_role, h_tech, desc, col) in enumerate(tech_cards):
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 4.0), Inches(3.25), Inches(3.733), Inches(3.45))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.word_wrap = True
        
        pn = ctf.paragraphs[0]
        pn.text = num
        pn.font.size = Pt(18)
        pn.font.bold = True
        pn.font.color.rgb = col

        pr = ctf.add_paragraph()
        pr.text = h_role
        pr.font.size = Pt(12)
        pr.font.bold = True
        pr.font.color.rgb = SLATE_900

        pt = ctf.add_paragraph()
        pt.text = h_tech
        pt.font.size = Pt(10)
        pt.font.bold = True
        pt.font.color.rgb = col

        pd = ctf.add_paragraph()
        pd.text = f"\n{desc}"
        pd.font.size = Pt(10)
        pd.font.color.rgb = SLATE_700

    add_footer(s6, 6)
    s6.notes_slide.notes_text_frame.text = (
        "In Slide 6, we address the Technology Plan of Action. Per the proposal guideline, we must justify why "
        "each tool was selected. We chose Next.js 16 for sub-100ms mobile performance without app-store barriers; "
        "Prisma with PostgreSQL for ACID transactional concurrency so two charities cannot double-claim "
        "the same batch; and Leaflet with OpenStreetMap for 100% free, billing-free geospatial routing."
    )

    # ==========================================
    # SLIDE 7: TIMELINE & ROADMAP
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Semester Milestones & Defense", 
               "4. Project Timeline: 16-Week Implementation Roadmap", 
               "Structured semester progression from system architecture to live UIU campus field pilot and defense")

    # 4 Phased Milestone Sprint Cards (Numbered 01, 02, 03, 04)
    sprints = [
        ("01", "PHASE 1: ARCHITECTURE", "WEEKS 1 – 4", 
         "• System Requirements (SRS)\n• Prisma relational schema models\n• 3-Portal responsive UI setup\n• Role-based authentication", 
         "Status: 100% Completed", PRIMARY_EMERALD),
        ("02", "PHASE 2: CORE LOGIC", "WEEKS 5 – 8", 
         "• 60s listing form & meal calculator\n• AI Spoilage dynamic countdown\n• Leaflet geospatial radar (3km)\n• 4-Digit OTP & QR handshake", 
         "Status: 90% Completed", ACCENT_BLUE),
        ("03", "PHASE 3: CAMPUS PILOT", "WEEKS 9 – 12", 
         "• UIU Cafeteria live trial run\n• Student cyclist squad onboarding\n• Satarkul orphanage delivery test\n• Turnaround latency tuning", 
         "Target: Live Field Run", ACCENT_AMBER),
        ("04", "PHASE 4: AUDIT & DEFENSE", "WEEKS 13 – 16", 
         "• Concurrency & stress testing\n• Anti-fraud security penetration test\n• Project impact analytics report\n• Final SE Lab defense presentation", 
         "Target: Final Defense", ACCENT_PURPLE)
    ]
    for idx, (num, title, weeks, bullets, status, col) in enumerate(sprints):
        card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 2.98), Inches(1.65), Inches(2.8), Inches(3.45))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.word_wrap = True
        
        pn = ctf.paragraphs[0]
        pn.text = num
        pn.font.size = Pt(16)
        pn.font.bold = True
        pn.font.color.rgb = col

        pt = ctf.add_paragraph()
        pt.text = title
        pt.font.size = Pt(11.5)
        pt.font.bold = True
        pt.font.color.rgb = SLATE_900

        pw = ctf.add_paragraph()
        pw.text = weeks
        pw.font.size = Pt(9.5)
        pw.font.bold = True
        pw.font.color.rgb = col

        pb = ctf.add_paragraph()
        pb.text = f"\n{bullets}"
        pb.font.size = Pt(9.5)
        pb.font.color.rgb = SLATE_700

        ps = ctf.add_paragraph()
        ps.text = f"\n{status}"
        ps.font.size = Pt(9.5)
        ps.font.bold = True
        ps.font.color.rgb = col

    # Bottom Summary & Q&A Strip
    bot_summary = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.3), Inches(11.733), Inches(1.4))
    bot_summary.fill.solid()
    bot_summary.fill.fore_color.rgb = EMERALD_LIGHT
    bot_summary.line.color.rgb = PRIMARY_EMERALD
    stf = bot_summary.text_frame
    stf.word_wrap = True
    
    sp1 = stf.paragraphs[0]
    sp1.text = "SUMMARY: Ready to Transform Campus Surplus into Immediate Hunger Relief"
    sp1.font.size = Pt(13)
    sp1.font.bold = True
    sp1.font.color.rgb = EMERALD_DARK

    sp2 = stf.add_paragraph()
    sp2.text = "Zero commercial barrier • Real community impact at UIU • Rigorous Software Engineering execution"
    sp2.font.size = Pt(11)
    sp2.font.color.rgb = SLATE_700

    sp3 = stf.add_paragraph()
    sp3.text = "Thank you! Open for Questions, Faculty Guidance & Feedback."
    sp3.font.size = Pt(12)
    sp3.font.bold = True
    sp3.font.color.rgb = PRIMARY_EMERALD

    add_footer(s7, 7)
    s7.notes_slide.notes_text_frame.text = (
        "In our final slide, we present our 16-week timeline divided into 4 agile phases. We have completed "
        "Phase 1 architecture and are 90% done with Phase 2 core logic. In Weeks 9 to 12, we conduct our live "
        "campus pilot at UIU with the central cafeteria and student cyclists, culminating in our final software "
        "engineering lab defense. Thank you for your time, and we look forward to your questions."
    )

    pptx_path = os.path.join(base_dir, "ShareBite_BD_SE_Lab_Presentation.pptx")
    prs.save(pptx_path)
    print(f"SUCCESS: Clean Academic PPTX generated ({os.path.getsize(pptx_path)/1024:.1f} KB) at: {pptx_path}")

if __name__ == "__main__":
    build_presentation()
