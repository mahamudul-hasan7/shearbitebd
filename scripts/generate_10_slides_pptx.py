# -*- coding: utf-8 -*-
"""
ShareBite BD - 10-Slide Academic Presentation Deck for 5 Group Members
Features:
- Perfectly distributed for 5 team members (2 slides / 2 mins each = 10 mins total)
- Zero clutter / generous whitespace / large readable fonts
- Strictly follows SE Lab Project Proposal Guideline (4 sections)
- Editable team member placeholders (Name, ID, Role)
- 16:9 Widescreen (13.333" x 7.5")
- Full English speaker notes on all 10 slides
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_10_slide_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Academic Modern Clean Palette
    BG_LIGHT = RGBColor(248, 250, 252)       # Slate 50
    CARD_BG = RGBColor(255, 255, 255)        # Pure White
    CARD_BORDER = RGBColor(226, 232, 240)    # Slate 200
    
    PRIMARY_EMERALD = RGBColor(5, 150, 105)  # Emerald 600
    EMERALD_DARK = RGBColor(6, 78, 59)       # Emerald 900
    EMERALD_LIGHT = RGBColor(236, 253, 245)  # Emerald 50
    
    SLATE_900 = RGBColor(15, 23, 42)         # Primary Dark Text
    SLATE_700 = RGBColor(51, 65, 85)         # Body Text
    SLATE_500 = RGBColor(100, 116, 139)      # Subtitles & Muted
    
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

    def add_header(slide, member_tag, section_tag, title_text, subtitle_text=""):
        # Member & Section Tag Pill
        tag_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.35), Inches(4.5), Inches(0.34))
        tag_box.fill.solid()
        tag_box.fill.fore_color.rgb = EMERALD_LIGHT
        tag_box.line.color.rgb = PRIMARY_EMERALD
        t_tf = tag_box.text_frame
        t_tf.word_wrap = True
        p_tag = t_tf.paragraphs[0]
        p_tag.text = f"{member_tag.upper()}  •  {section_tag.upper()}"
        p_tag.font.size = Pt(9.5)
        p_tag.font.bold = True
        p_tag.font.color.rgb = PRIMARY_EMERALD
        p_tag.alignment = PP_ALIGN.CENTER

        # Slide Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.733), Inches(0.55))
        tf_t = t_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = SLATE_900

        # Subtitle
        if subtitle_text:
            s_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.24), Inches(11.733), Inches(0.35))
            tf_s = s_box.text_frame
            tf_s.word_wrap = True
            p_s = tf_s.paragraphs[0]
            p_s.text = subtitle_text
            p_s.font.size = Pt(11)
            p_s.font.color.rgb = SLATE_500

    def add_footer(slide, slide_num, speaker_name=""):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.92), Inches(11.733), Inches(0.35))
        tf = footer_box.text_frame
        p = tf.paragraphs[0]
        speaker_str = f"Presenter: {speaker_name}  •  " if speaker_name else ""
        p.text = f"ShareBite BD  —  Software Engineering Lab Proposal Deck     |     {speaker_str}Slide {slide_num} / 10"
        p.font.size = Pt(9.5)
        p.font.color.rgb = SLATE_500

    # =========================================================================
    # SLIDE 1: TITLE & TEAM ROSTER (MEMBER 1)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Top Tag
    t1_tag = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.65), Inches(4.5), Inches(0.38))
    t1_tag.fill.solid()
    t1_tag.fill.fore_color.rgb = EMERALD_LIGHT
    t1_tag.line.color.rgb = PRIMARY_EMERALD
    p_t1 = t1_tag.text_frame.paragraphs[0]
    p_t1.text = "CSE LAB • 10-MINUTE PROJECT PROPOSAL"
    p_t1.font.size = Pt(10)
    p_t1.font.bold = True
    p_t1.font.color.rgb = PRIMARY_EMERALD
    p_t1.alignment = PP_ALIGN.CENTER

    # Project Title & Subtitle
    t1_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.15), Inches(11.7), Inches(1.5))
    tf1 = t1_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "ShareBite BD"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = EMERALD_DARK

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "Hyper-Local Surplus Food Rescue & Safety-Compliant Redistribution Network"
    p1_sub.font.size = Pt(17)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = SLATE_700

    # Badges
    badges_row = [
        ("🎯 UN SDG 2: Zero Hunger", PRIMARY_EMERALD, EMERALD_LIGHT),
        ("🌱 UN SDG 12: Responsible Consumption", PRIMARY_EMERALD, EMERALD_LIGHT),
        ("📍 Pilot: UIU Central Cafeteria", ACCENT_BLUE, BLUE_LIGHT)
    ]
    for idx, (b_txt, b_col, b_fill) in enumerate(badges_row):
        b_shp = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 3.95), Inches(2.75), Inches(3.8), Inches(0.4))
        b_shp.fill.solid()
        b_shp.fill.fore_color.rgb = b_fill
        b_shp.line.color.rgb = b_col
        p = b_shp.text_frame.paragraphs[0]
        p.text = b_txt
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = b_col
        p.alignment = PP_ALIGN.CENTER

    # 5 Team Members Card (Editable Placeholders)
    team_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.35), Inches(11.733), Inches(3.35))
    team_card.fill.solid()
    team_card.fill.fore_color.rgb = CARD_BG
    team_card.line.color.rgb = PRIMARY_EMERALD
    ttf = team_card.text_frame
    ttf.word_wrap = True
    
    pt_h = ttf.paragraphs[0]
    pt_h.text = "👥 PROJECT TEAM ROSTER (5 MEMBERS)"
    pt_h.font.size = Pt(12)
    pt_h.font.bold = True
    pt_h.font.color.rgb = PRIMARY_EMERALD

    members = [
        ("Member 1 (Lead & Problem Identification):", "[Your Name 1]  •  Student ID: [011 2X1 XXX]  •  Lead / System Architect"),
        ("Member 2 (Evidence & Solution Architecture):", "[Your Name 2]  •  Student ID: [011 2X1 XXX]  •  Research & Data Lead"),
        ("Member 3 (Core Features & Workflow Outputs):", "[Your Name 3]  •  Student ID: [011 2X1 XXX]  •  Frontend & PWA Specialist"),
        ("Member 4 (Plan of Action & Technology Stack):", "[Your Name 4]  •  Student ID: [011 2X1 XXX]  •  Backend & Database Engineer"),
        ("Member 5 (Timeline, Campus Pilot & Testing):", "[Your Name 5]  •  Student ID: [011 2X1 XXX]  •  QA & Field Operations Lead")
    ]
    for m_role, m_info in members:
        p = ttf.add_paragraph()
        run1 = p.add_run()
        run1.text = f"• {m_role} "
        run1.font.bold = True
        run1.font.size = Pt(10.5)
        run1.font.color.rgb = SLATE_900

        run2 = p.add_run()
        run2.text = m_info
        run2.font.size = Pt(10.5)
        run2.font.color.rgb = SLATE_700

    add_footer(s1, 1, "Member 1")
    s1.notes_slide.notes_text_frame.text = (
        "Good morning respected faculty and peers. Welcome to our Software Engineering Lab Project Proposal "
        "presentation on 'ShareBite BD'. I am Member 1, the team lead, presenting alongside my 4 teammates. "
        "Our project is an innovative hyper-local platform engineered to rescue surplus cooked food from university "
        "cafeterias and deliver it to nearby shelters within a strict 30-minute safety window."
    )

    # =========================================================================
    # SLIDE 2: SECTION 1 — PROBLEM IDENTIFICATION (MEMBER 1)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Member 1", "Section 1: Problem Identification", 
               "1. Problem Identification: What Problem Are We Solving?", 
               "Stating the problem clearly in simple terms and explaining why it is critically important")

    # Left Card: The Plain Truth
    p_left = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(4.5), Inches(4.3))
    p_left.fill.solid()
    p_left.fill.fore_color.rgb = CARD_BG
    p_left.line.color.rgb = PRIMARY_EMERALD
    pltf = p_left.text_frame
    pltf.word_wrap = True
    
    p1 = pltf.paragraphs[0]
    p1.text = "THE PROBLEM IN SIMPLE TERMS"
    p1.font.size = Pt(11)
    p1.font.bold = True
    p1.font.color.rgb = PRIMARY_EMERALD

    p2 = pltf.add_paragraph()
    p2.text = "Food Is Thrown Away While People Sleep Hungry."
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = SLATE_900

    p3 = pltf.add_paragraph()
    p3.text = (
        "\nEvery single night in Dhaka, massive quantities of fresh, hot, hygienic meals are "
        "dumped into garbage bins.\n\n"
        "This is NOT a food shortage problem.\n\n"
        "It is an INFORMATION and LOGISTICS failure: kitchens don't know who needs food nearby, "
        "and shelters have no way to collect it before it spoils."
    )
    p3.font.size = Pt(11)
    p3.font.color.rgb = SLATE_700

    # Right: 3 Key Problem Pillars (01, 02, 03)
    pillars_p = [
        ("01", "THE DAILY MIDNIGHT FOOD DUMP", 
         "Campus cafeterias (e.g. UIU Central Cafeteria) and restaurants cook in bulk. At 10 PM, 40–80 kg of edible food is thrown into dumpsters simply because donors lack instant charity contacts.", 
         ACCENT_ROSE),
        ("02", "THE 4-HOUR BIOLOGICAL SAFETY CLOCK", 
         "Cooked food enters the bacterial danger zone (5°C–60°C). Under BFSA guidelines, it must be eaten within 4 hours. Manual coordination takes 5+ hours, resulting in complete food spoilage.", 
         ACCENT_AMBER),
        ("03", "THE MISSING MICRO-LOGISTICS LINK", 
         "Local shelters and orphanages have zero standby vehicles, fuel budget, or couriers at night. Food is available 2 km away, but no automated software dispatches riders to deliver it.", 
         ACCENT_BLUE)
    ]
    for idx, (num, h_text, b_text, col) in enumerate(pillars_p):
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.6), Inches(1.65 + idx * 1.48), Inches(6.933), Inches(1.38))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        ctf = card.text_frame
        ctf.word_wrap = True
        
        pt = ctf.paragraphs[0]
        r1 = pt.add_run()
        r1.text = f"{num}  "
        r1.font.bold = True
        r1.font.size = Pt(13)
        r1.font.color.rgb = col
        
        r2 = pt.add_run()
        r2.text = h_text
        r2.font.bold = True
        r2.font.size = Pt(11.5)
        r2.font.color.rgb = SLATE_900

        pd = ctf.add_paragraph()
        pd.text = b_text
        pd.font.size = Pt(10)
        pd.font.color.rgb = SLATE_700

    # Bottom Pill
    bot1 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.12), Inches(11.733), Inches(0.6))
    bot1.fill.solid()
    bot1.fill.fore_color.rgb = EMERALD_LIGHT
    bot1.line.color.rgb = PRIMARY_EMERALD
    p_b = bot1.text_frame.paragraphs[0]
    p_b.text = "💡 SUMMARY: Food exists and hunger exists within 3 km, but lack an automated software platform to connect them."
    p_b.font.size = Pt(10.5)
    p_b.font.bold = True
    p_b.font.color.rgb = EMERALD_DARK
    p_b.alignment = PP_ALIGN.CENTER

    add_footer(s2, 2, "Member 1")
    s2.notes_slide.notes_text_frame.text = (
        "In Slide 2, we define the problem in simple terms. In Dhaka, food waste is not caused by food shortage, "
        "but by a communication and logistics breakdown. At UIU and other campuses, cafeteria operators cook in bulk. "
        "At 10 PM, 40-80 kg of edible meals are discarded because donors lack instant charity contacts, and food "
        "spoils after 4 hours under BFSA rules. Now I hand over to Member 2 to present the evidence and solution approach."
    )

    # =========================================================================
    # SLIDE 3: SECTION 1 — EVIDENCE & REAL-WORLD IMPACT (MEMBER 2)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Member 2", "Section 1: Evidence & Real-World Impact", 
               "1. Evidence & Data: Backed by Research & Concrete Numbers", 
               "Authoritative statistics on national food waste, biological safety limits, and urban food insecurity")

    # 4 Big KPI Metric Boxes Across Top
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
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 4.0), Inches(3.35), Inches(3.733), Inches(3.35))
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

    add_footer(s3, 3, "Member 2")
    s3.notes_slide.notes_text_frame.text = (
        "Thank you, Member 1. I am Member 2, presenting the evidence and impact. According to the UNEP 2024 "
        "Food Waste Index, Bangladesh produces 10.7 million tons of food waste every year. Meanwhile, BBS reports "
        "that 3.8 million people in Dhaka suffer from acute food insecurity. Our system enforces the BFSA 4-hour "
        "safety limit to eliminate health risks while advancing UN SDG 2 (Zero Hunger) and SDG 12 (Climate Action)."
    )

    # =========================================================================
    # SLIDE 4: SECTION 2 — SOLUTION IDEA & 3-SIDED ECOSYSTEM (MEMBER 2)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Member 2", "Section 2: Solution Approach", 
               "2. Solution: The Core Idea & 3-Sided Ecosystem", 
               "An idea-driven, synchronized hyper-local network engineered for 15–30 minute rescue velocity")

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
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 4.0), Inches(3.25), Inches(3.733), Inches(3.45))
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

    add_footer(s4, 4, "Member 2")
    s4.notes_slide.notes_text_frame.text = (
        "In Slide 4, we present our core solution approach. As instructed by our proposal guidelines, "
        "we can describe ShareBite BD in one single line that a kid or parent can grasp: it is an Uber-like "
        "app where campus cafeterias post extra food, and student volunteers bike it to nearby orphanages in "
        "30 minutes before it spoils. Our 3-sided network connects Donors, NGOs, and Volunteers. Now I hand over "
        "to Member 3 to walk through the system's core features."
    )

    # =========================================================================
    # SLIDE 5: SECTION 2 — MAIN FEATURES PART 1: POSTING & RADAR MAP (MEMBER 3)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Member 3", "Section 2: Main Features (Part 1)", 
               "2. Main Features: 60-Sec Post & Proximity Radar Map", 
               "What will the end system be able to perform: Rapid listing, AI spoilage detection, and geo-filtering")

    # Feature 1 Card
    f1_card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(5.75), Inches(4.3))
    f1_card.fill.solid()
    f1_card.fill.fore_color.rgb = CARD_BG
    f1_card.line.color.rgb = PRIMARY_EMERALD
    f1_tf = f1_card.text_frame
    f1_tf.word_wrap = True

    p1 = f1_tf.paragraphs[0]
    p1.text = "FEATURE 01"
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = PRIMARY_EMERALD

    p2 = f1_tf.add_paragraph()
    p2.text = "60-Sec Listing & AI Spoilage Meter"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = SLATE_900

    p3 = f1_tf.add_paragraph()
    p3.text = (
        "\n• What it does: Cafeteria staff simply enters dish name, quantity, and cooking timestamp in 3 clicks.\n\n"
        "• AI Spoilage Gauge: Computes real-time biological countdown based on ambient temperature and BFSA safe holding rules.\n\n"
        "• Automated Meal Calculator: Automatically converts raw kilograms into child servings (e.g., '40 kg Biryani = 80–100 meals').\n\n"
        "• Safety Timeout Lock: Automatically de-lists food if remaining pickup window drops below 45 minutes to guarantee safety."
    )
    p3.font.size = Pt(11)
    p3.font.color.rgb = SLATE_700

    # Feature 2 Card
    f2_card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.78), Inches(1.65), Inches(5.75), Inches(4.3))
    f2_card.fill.solid()
    f2_card.fill.fore_color.rgb = CARD_BG
    f2_card.line.color.rgb = ACCENT_BLUE
    f2_tf = f2_card.text_frame
    f2_tf.word_wrap = True

    p4 = f2_tf.paragraphs[0]
    p4.text = "FEATURE 02"
    p4.font.size = Pt(12)
    p4.font.bold = True
    p4.font.color.rgb = ACCENT_BLUE

    p5 = f2_tf.add_paragraph()
    p5.text = "3–5 km Hyper-Local Radar Map"
    p5.font.size = Pt(16)
    p5.font.bold = True
    p5.font.color.rgb = SLATE_900

    p6 = f2_tf.add_paragraph()
    p6.text = (
        "\n• What it does: Interactive GIS radar map displaying available surplus batches in real-time.\n\n"
        "• Traffic-Proof Proximity: Strictly prioritizes donations within a 3–5 km radius to bypass Dhaka's gridlock.\n\n"
        "• 1-Click Rescue Claim: Verified NGO centers can lock and claim a food batch with a single tap.\n\n"
        "• Urgency Rings: Food lots with under 2 hours remaining flash with pulsating red rings as 'Critical Urgency'."
    )
    p6.font.size = Pt(11)
    p6.font.color.rgb = SLATE_700

    # Bottom Pill
    bot_f = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.12), Inches(11.733), Inches(0.6))
    bot_f.fill.solid()
    bot_f.fill.fore_color.rgb = BLUE_LIGHT
    bot_f.line.color.rgb = ACCENT_BLUE
    p_bf = bot_f.text_frame.paragraphs[0]
    p_bf.text = "⚡ OUTPUT: A donor posts surplus in under 60 seconds; nearby charities see it on the radar map instantly."
    p_bf.font.size = Pt(10.5)
    p_bf.font.bold = True
    p_bf.font.color.rgb = ACCENT_BLUE
    p_bf.alignment = PP_ALIGN.CENTER

    add_footer(s5, 5, "Member 3")
    s5.notes_slide.notes_text_frame.text = (
        "Thank you, Member 2. I am Member 3, presenting the core features. In Slide 5, we show how easy it is "
        "for donors: a 60-second listing module that automatically calculates child servings and tracks spoilage. "
        "On the other side, NGOs see a real-time 3-5 km radar map that cuts through Dhaka traffic by focusing only "
        "on immediate hyper-local rescues. Now let us examine the volunteer dispatch and anti-fraud mechanisms."
    )

    # =========================================================================
    # SLIDE 6: SECTION 2 — MAIN FEATURES PART 2: DISPATCH & OTP HANDOVER (MEMBER 3)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Member 3", "Section 2: Main Features (Part 2)", 
               "2. Main Features: Uber-Style Dispatch & OTP Handshake", 
               "What will the end system be able to perform: Crowdsourced student logistics and zero-trust verification")

    # Feature 3 Card
    f3_card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(5.75), Inches(4.3))
    f3_card.fill.solid()
    f3_card.fill.fore_color.rgb = CARD_BG
    f3_card.line.color.rgb = ACCENT_AMBER
    f3_tf = f3_card.text_frame
    f3_tf.word_wrap = True

    p1 = f3_tf.paragraphs[0]
    p1.text = "FEATURE 03"
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = ACCENT_AMBER

    p2 = f3_tf.add_paragraph()
    p2.text = "Uber-Style Volunteer Dispatch"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = SLATE_900

    p3 = f3_tf.add_paragraph()
    p3.text = (
        "\n• What it does: Micro-logistics dispatch engine powered by university cyclists and bikers.\n\n"
        "• Smart Commute Alerts: Broadcasts push notifications to students heading home along the delivery corridor.\n\n"
        "• Turn-by-Turn Navigation: Displays donor location, recipient shelter, and recommended cycling route.\n\n"
        "• Thermal Carrier Compliance: In-app checklist prompts volunteers to verify insulated thermal bag hygiene."
    )
    p3.font.size = Pt(11)
    p3.font.color.rgb = SLATE_700

    # Feature 4 Card
    f4_card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.78), Inches(1.65), Inches(5.75), Inches(4.3))
    f4_card.fill.solid()
    f4_card.fill.fore_color.rgb = CARD_BG
    f4_card.line.color.rgb = ACCENT_PURPLE
    f4_tf = f4_card.text_frame
    f4_tf.word_wrap = True

    p4 = f4_tf.paragraphs[0]
    p4.text = "FEATURE 04"
    p4.font.size = Pt(12)
    p4.font.bold = True
    p4.font.color.rgb = ACCENT_PURPLE

    p5 = f4_tf.add_paragraph()
    p5.text = "4-Digit OTP & QR Handshake"
    p5.font.size = Pt(16)
    p5.font.bold = True
    p5.font.color.rgb = SLATE_900

    p6 = f4_tf.add_paragraph()
    p6.text = (
        "\n• What it does: Cryptographic dual-layer verification at pickup and drop-off.\n\n"
        "• Pickup Verification: Cafeteria donor only releases food when volunteer enters the secret 4-digit PIN (e.g. '7429').\n\n"
        "• Drop-off Handover: Shelter representative scans dynamic QR token upon arrival to confirm delivery.\n\n"
        "• Anti-Fraud Guarantee: 100% eliminates food diversion, black-market resale, or false delivery claims."
    )
    p6.font.size = Pt(11)
    p6.font.color.rgb = SLATE_700

    # Bottom Pill
    bot_flow = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.12), Inches(11.733), Inches(0.6))
    bot_flow.fill.solid()
    bot_flow.fill.fore_color.rgb = EMERALD_LIGHT
    bot_flow.line.color.rgb = PRIMARY_EMERALD
    p_bfl = bot_flow.text_frame.paragraphs[0]
    p_bfl.text = "🔒 WORKFLOW: 60s Post ➔ AI Spoilage Verification ➔ 3km Radar Alert ➔ Student Biker Dispatch ➔ OTP Handshake Handover"
    p_bfl.font.size = Pt(10)
    p_bfl.font.bold = True
    p_bfl.font.color.rgb = EMERALD_DARK
    p_bfl.alignment = PP_ALIGN.CENTER

    add_footer(s6, 6, "Member 3")
    s6.notes_slide.notes_text_frame.text = (
        "In Slide 6, we highlight our volunteer dispatch and anti-fraud protocol. Student cyclists receive "
        "Uber-style alerts along their commute home. To prevent theft or food diversion, we implement a strict "
        "4-digit OTP at pickup and a dynamic QR code scan at the shelter. This guarantees that 100% of the food "
        "reaches hungry children. Now I hand over to Member 4 to explain our technology plan of action."
    )

    # =========================================================================
    # SLIDE 7: SECTION 3 — PLAN OF ACTION: ARCHITECTURE PIPELINE (MEMBER 4)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Member 4", "Section 3: Plan of Action (Part 1)", 
               "3. Plan of Action: High-Level Architecture & Pipeline", 
               "End-to-end data flow pipeline connecting donors, business logic, GIS, and couriers without deep code")

    # Pipeline Flow Box Across Top
    pipe_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(11.733), Inches(1.4))
    pipe_box.fill.solid()
    pipe_box.fill.fore_color.rgb = CARD_BG
    pipe_box.line.color.rgb = PRIMARY_EMERALD
    ptf = pipe_box.text_frame
    ptf.word_wrap = True
    
    p_ph = ptf.paragraphs[0]
    p_ph.text = "🏗️ END-TO-END DATA FLOW PIPELINE"
    p_ph.font.size = Pt(10.5)
    p_ph.font.bold = True
    p_ph.font.color.rgb = PRIMARY_EMERALD

    p_pb = ptf.add_paragraph()
    p_pb.text = "01 Donor Web Portal (Next.js 16) ➔ 02 API & Validation (TypeScript / Zod) ➔ 03 Database (Prisma + PostgreSQL) ➔ 04 Radar GIS (Leaflet + Haversine 3km) ➔ 05 Volunteer PWA (WebSockets & FCM) ➔ 06 OTP Handshake Handover"
    p_pb.font.size = Pt(11)
    p_pb.font.bold = True
    p_pb.font.color.rgb = SLATE_900

    # 3 Architecture Tier Cards (Numbered 01, 02, 03)
    tiers = [
        ("01", "PRESENTATION LAYER", "Next.js 16 App Router & PWA", 
         "• Responsive Web Interface for Cafeteria Donors\n• Progressive Web App (PWA) for Volunteer Cyclists\n• Server-Side Rendering (SSR) for sub-100ms response\n• Tailwind CSS v4 design system with mobile-first UI", 
         PRIMARY_EMERALD),
        ("02", "APPLICATION & LOGIC TIER", "Node.js Server Actions & Zod", 
         "• Real-time AI Spoilage dynamic countdown engine\n• Cryptographic 4-Digit OTP generation & verification\n• Role-based access control (Donor, NGO, Volunteer)\n• WebSockets push alert broker for instant courier matching", 
         ACCENT_BLUE),
        ("03", "DATA & GEOSPATIAL TIER", "PostgreSQL + Prisma ORM + Leaflet", 
         "• ACID relational schema for Users, Listings, Claims & Audits\n• Atomic claim locking to eliminate race conditions\n• OpenStreetMap client-side Haversine distance math\n• Zero-cost geospatial stack without paid API keys", 
         ACCENT_PURPLE)
    ]
    for idx, (num, h_tier, h_tech, desc, col) in enumerate(tiers):
        card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 4.0), Inches(3.25), Inches(3.733), Inches(3.45))
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
        pt.text = h_tier
        pt.font.size = Pt(12)
        pt.font.bold = True
        pt.font.color.rgb = SLATE_900

        pr = ctf.add_paragraph()
        pr.text = h_tech
        pr.font.size = Pt(10)
        pr.font.bold = True
        pr.font.color.rgb = col

        pd = ctf.add_paragraph()
        pd.text = f"\n{desc}"
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = SLATE_700

    add_footer(s7, 7, "Member 4")
    s7.notes_slide.notes_text_frame.text = (
        "Thank you, Member 3. I am Member 4, presenting the Technology Plan of Action. In Slide 7, we present "
        "our 3-tier architecture: the Presentation layer running Next.js 16 PWA; the Application layer executing "
        "our spoilage algorithm and OTP verification; and the Data layer backed by Prisma ORM and PostgreSQL "
        "with Leaflet GIS. Now let us examine exactly why each technology was chosen."
    )

    # =========================================================================
    # SLIDE 8: SECTION 3 — PLAN OF ACTION: TECH SELECTION & 'WHY' (MEMBER 4)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Member 4", "Section 3: Plan of Action (Part 2)", 
               "3. Plan of Action: Technology Selection & Rationale", 
               "What technologies will be used and why: Clear justification for frameworks and libraries")

    # 3 Tech Selection Cards (Numbered 01, 02, 03 - With Clear Rationale)
    tech_reasons = [
        ("01", "FRONTEND FRAMEWORK", "Next.js 16 + React 19 + Tailwind CSS", 
         "What It Does: Powers the unified web portal and mobile PWA for Donors, NGOs, and Volunteers.\n\nWhy Chosen:\n• Server-Side Rendering (SSR) delivers sub-100ms load times over 4G mobile connections\n• Progressive Web App (PWA) eliminates app-store install friction for student cyclists\n• Tailwind CSS v4 provides a lightweight, responsive UI footprint", 
         PRIMARY_EMERALD),
        ("02", "BACKEND & ORM", "Prisma ORM + PostgreSQL + TypeScript", 
         "What It Does: Handles data persistence, authentication, and the transactional claim state machine.\n\nWhy Chosen:\n• Strict ACID transactions prevent race conditions (two NGOs cannot double-claim the same food batch)\n• End-to-end type safety eliminates runtime data mismatch\n• Relational integrity links Donors, NGOs, and Couriers seamlessly", 
         ACCENT_BLUE),
        ("03", "GEOSPATIAL & MAPS", "Leaflet.js + OpenStreetMap (OSM)", 
         "What It Does: Renders interactive radar maps, circular radius queries, and distance calculations.\n\nWhy Chosen:\n• 100% open-source without Google Maps billing or credit card dependencies\n• Lightweight client-side Haversine circular radius queries\n• Runs smoothly with low battery and memory consumption on mobile devices", 
         ACCENT_AMBER)
    ]
    for idx, (num, h_role, h_tech, desc, col) in enumerate(tech_reasons):
        card = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 4.0), Inches(1.65), Inches(3.733), Inches(4.35))
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

    # Bottom Pill
    bot_tech = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.15), Inches(11.733), Inches(0.6))
    bot_tech.fill.solid()
    bot_tech.fill.fore_color.rgb = EMERALD_LIGHT
    bot_tech.line.color.rgb = PRIMARY_EMERALD
    p_bt = bot_tech.text_frame.paragraphs[0]
    p_bt.text = "💡 RATIONALE SUMMARY: Zero recurring cloud fees, strict type-safety, and instantaneous mobile performance."
    p_bt.font.size = Pt(10.5)
    p_bt.font.bold = True
    p_bt.font.color.rgb = EMERALD_DARK
    p_bt.alignment = PP_ALIGN.CENTER

    add_footer(s8, 8, "Member 4")
    s8.notes_slide.notes_text_frame.text = (
        "In Slide 8, we provide the technical justification requested by the proposal guideline: Next.js 16 "
        "gives us sub-100ms load times and PWA capability without forcing volunteers to download an app; "
        "Prisma with PostgreSQL provides ACID transactional concurrency so two charities never claim the "
        "same food batch; and Leaflet with OpenStreetMap gives us 100% free geospatial routing without expensive "
        "Google Maps API bills. Now I pass the microphone to Member 5 for the timeline and pilot rollout."
    )

    # =========================================================================
    # SLIDE 9: SECTION 4 — TIMELINE & 16-WEEK ROADMAP (MEMBER 5)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Member 5", "Section 4: Project Timeline", 
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
        card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 2.98), Inches(1.65), Inches(2.8), Inches(4.35))
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
        pb.font.size = Pt(10)
        pb.font.color.rgb = SLATE_700

        ps = ctf.add_paragraph()
        ps.text = f"\n{status}"
        ps.font.size = Pt(10)
        ps.font.bold = True
        ps.font.color.rgb = col

    # Bottom Pill
    bot_s = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.15), Inches(11.733), Inches(0.6))
    bot_s.fill.solid()
    bot_s.fill.fore_color.rgb = EMERALD_LIGHT
    bot_s.line.color.rgb = PRIMARY_EMERALD
    p_bs = bot_s.text_frame.paragraphs[0]
    p_bs.text = "🎯 MILESTONE OBJECTIVE: Production-grade delivery on schedule with a verified campus field pilot."
    p_bs.font.size = Pt(10.5)
    p_bs.font.bold = True
    p_bs.font.color.rgb = EMERALD_DARK
    p_bs.alignment = PP_ALIGN.CENTER

    add_footer(s9, 9, "Member 5")
    s9.notes_slide.notes_text_frame.text = (
        "Thank you, Member 4. I am Member 5, presenting our project timeline and deployment strategy. "
        "In Slide 9, our 16-week timeline is organized into 4 agile sprints: Phase 1 architecture is complete; "
        "Phase 2 core logic is 90% ready; Phase 3 will test our system live at the UIU Central Cafeteria with "
        "student cyclists; and Phase 4 will finalize stress testing, security audits, and our final lab defense."
    )

    # =========================================================================
    # SLIDE 10: PILOT DEPLOYMENT, SUMMARY & Q&A (MEMBER 5)
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "Member 5", "Conclusion & Q&A", 
               "Target Pilot, Project Summary & Q&A Session", 
               "Transforming campus surplus into immediate hunger relief with rigorous software engineering")

    # Left: Campus Pilot Deployment Card
    pilot_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(5.75), Inches(4.3))
    pilot_card.fill.solid()
    pilot_card.fill.fore_color.rgb = CARD_BG
    pilot_card.line.color.rgb = PRIMARY_EMERALD
    ptf10 = pilot_card.text_frame
    ptf10.word_wrap = True

    p1 = ptf10.paragraphs[0]
    p1.text = "📍 UIU CAMPUS PILOT COMMITMENT"
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = PRIMARY_EMERALD

    p2 = ptf10.add_paragraph()
    p2.text = "Real-World Field Validation in Weeks 9–12"
    p2.font.size = Pt(15)
    p2.font.bold = True
    p2.font.color.rgb = SLATE_900

    p3 = ptf10.add_paragraph()
    p3.text = (
        "\n• Primary Donor Site: UIU Central Cafeteria (Closing hours surplus).\n\n"
        "• Courier Squad: UIU student cyclists commuting toward Satarkul & Badda.\n\n"
        "• Recipient Beneficiaries: Local Madrashas, Orphanages & Shelter Homes within 3 km.\n\n"
        "• Evaluation Metric: Measuring average rescue latency (<30 mins) and food temperature compliance (>65°C)."
    )
    p3.font.size = Pt(11)
    p3.font.color.rgb = SLATE_700

    # Right: Summary & Q&A Card
    qa_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.78), Inches(1.65), Inches(5.75), Inches(4.3))
    qa_card.fill.solid()
    qa_card.fill.fore_color.rgb = EMERALD_LIGHT
    qa_card.line.color.rgb = PRIMARY_EMERALD
    qtf = qa_card.text_frame
    qtf.word_wrap = True

    p4 = qtf.paragraphs[0]
    p4.text = "🚀 PROJECT SUMMARY"
    p4.font.size = Pt(12)
    p4.font.bold = True
    p4.font.color.rgb = EMERALD_DARK

    p5 = qtf.add_paragraph()
    p5.text = "Zero Waste • Zero Hunger • Safe Delivery"
    p5.font.size = Pt(15)
    p5.font.bold = True
    p5.font.color.rgb = SLATE_900

    p6 = qtf.add_paragraph()
    p6.text = (
        "\n• Idea: Turn 40–80kg daily campus food waste into 80–100 meals.\n\n"
        "• Technology: Next.js 16 + Prisma + Leaflet GIS with zero operating cost.\n\n"
        "• Integrity: 4-digit OTP & QR protocol prevents food theft and fraud.\n\n"
        "• Academic Rigor: Complete adherence to SE Lab software development standards."
    )
    p6.font.size = Pt(11)
    p6.font.color.rgb = SLATE_700

    # Bottom Thank You & Q&A Banner
    thank_banner = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.12), Inches(11.733), Inches(0.65))
    thank_banner.fill.solid()
    thank_banner.fill.fore_color.rgb = CARD_BG
    thank_banner.line.color.rgb = PRIMARY_EMERALD
    btf10 = thank_banner.text_frame
    btf10.word_wrap = True
    
    p_th = btf10.paragraphs[0]
    p_th.text = "THANK YOU, RESISTED FACULTY & PEERS!  •  OPEN FOR QUESTIONS & FEEDBACK"
    p_th.font.size = Pt(12)
    p_th.font.bold = True
    p_th.font.color.rgb = PRIMARY_EMERALD
    p_th.alignment = PP_ALIGN.CENTER

    add_footer(s10, 10, "Member 5")
    s10.notes_slide.notes_text_frame.text = (
        "In our final slide, we reaffirm our commitment to a real campus pilot at UIU, directly tackling "
        "food waste while feeding vulnerable children nearby with zero-cost open-source technology. On behalf "
        "of our entire 5-member team, thank you respected faculty and peers. We are now open and eager for your "
        "questions, feedback, and evaluation."
    )

    pptx_path = os.path.join(base_dir, "ShareBite_BD_SE_Lab_Presentation.pptx")
    prs.save(pptx_path)
    print(f"SUCCESS: 10-Slide Academic PPTX generated ({os.path.getsize(pptx_path)/1024:.1f} KB) at: {pptx_path}")

if __name__ == "__main__":
    build_10_slide_presentation()
