import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Corporate Industrial Palette
    BG_DARK = RGBColor(11, 15, 25)       # #0B0F19
    CARD_BG = RGBColor(17, 24, 39)       # #111827
    CARD_BORDER = RGBColor(31, 41, 61)   # #1F293D
    CYAN_ACCENT = RGBColor(6, 182, 212)  # #06B6D4
    EMERALD = RGBColor(16, 185, 129)     # #10B981
    ROSE = RGBColor(244, 63, 94)         # #F43F5E
    AMBER = RGBColor(245, 158, 11)       # #F59E0B
    WHITE = RGBColor(255, 255, 255)
    SLATE_LIGHT = RGBColor(203, 213, 225)
    SLATE_MUTED = RGBColor(148, 163, 184)

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background() # no border
        return bg

    def add_header(slide, category_tag, title_text, subtitle_text):
        # Category Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.4))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = category_tag.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = CYAN_ACCENT

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.6))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

        # Subtitle
        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(11.5), Inches(0.4))
        tf_sub = sub_box.text_frame
        tf_sub.word_wrap = True
        p_sub = tf_sub.paragraphs[0]
        p_sub.text = subtitle_text
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = SLATE_MUTED

    def add_card(slide, left, top, width, height, title, body_bullets, accent_color=CYAN_ACCENT):
        # Card shape
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1.2)

        # Content Box
        tb = slide.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), width - Inches(0.5), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        # Card Title
        p_head = tf.paragraphs[0]
        p_head.text = title
        p_head.font.size = Pt(14)
        p_head.font.bold = True
        p_head.font.color.rgb = accent_color
        p_head.space_after = Pt(8)

        # Bullets
        for bullet in body_bullets:
            p = tf.add_paragraph()
            p.text = "• " + bullet
            p.font.size = Pt(11)
            p.font.color.rgb = SLATE_LIGHT
            p.space_after = Pt(4)

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Accent decorative banner
    accent_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.12), Inches(3.8))
    accent_bar.fill.solid()
    accent_bar.fill.fore_color.rgb = CYAN_ACCENT
    accent_bar.line.fill.background()

    # Title & Subtitle box
    tbox = s1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11.0), Inches(3.8))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p_badge = tf1.paragraphs[0]
    p_badge.text = "AUTOMOTIVE MANUFACTURING QUALITY ASSURANCE & TELEMETRY"
    p_badge.font.size = Pt(13)
    p_badge.font.bold = True
    p_badge.font.color.rgb = CYAN_ACCENT
    p_badge.space_after = Pt(12)

    p_main = tf1.add_paragraph()
    p_main.text = "ApexQA Platform"
    p_main.font.size = Pt(36)
    p_main.font.bold = True
    p_main.font.color.rgb = WHITE
    p_main.space_after = Pt(8)

    p_sub = tf1.add_paragraph()
    p_sub.text = "Real-Time Defect Monitoring, Digital Inspection Workflows & SPC Analytics"
    p_sub.font.size = Pt(18)
    p_sub.font.color.rgb = SLATE_LIGHT
    p_sub.space_after = Pt(20)

    p_stack = tf1.add_paragraph()
    p_stack.text = "React  |  TypeScript  |  Node.js  |  Express.js  |  PostgreSQL  |  Redis  |  WebSockets  |  Docker"
    p_stack.font.size = Pt(12)
    p_stack.font.bold = True
    p_stack.font.color.rgb = EMERALD

    # Footer metadata
    footer_box = s1.shapes.add_textbox(Inches(1.2), Inches(6.2), Inches(11.0), Inches(0.5))
    tf_f = footer_box.text_frame
    p_f = tf_f.paragraphs[0]
    p_f.text = "IATF 16949 & ISO 9001 Compliant  •  Gigafactory Assembly Line Operations  •  Unified Single Localhost"
    p_f.font.size = Pt(11)
    p_f.font.color.rgb = SLATE_MUTED

    # -------------------------------------------------------------
    # SLIDE 2: Industry Problem & Executive Solution
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Executive Overview", "Automotive Quality Assurance Challenges & Solution",
               "Eliminating defect propagation across assembly shops before vehicles leave the factory")

    add_card(s2, Inches(0.8), Inches(2.0), Inches(3.6), Inches(4.8), "Manufacturing Challenges", [
        "Defect Propagation: Body or weld flaws not detected early require costly end-of-line teardown.",
        "Paper & Clipboards: Manual inspection clipboards cause lag in quality containment.",
        "Disconnected Rework: Repair bays lack root-cause traceability and 5-Why containment.",
        "Cost of Poor Quality (COPQ): Millions lost annually in scrapped components and lost cycle time."
    ], ROSE)

    add_card(s2, Inches(4.8), Inches(2.0), Inches(3.6), Inches(4.8), "The ApexQA Solution", [
        "Zero-Paper Digital Gates: Touchscreen and tablet checklists at each workstation stage.",
        "Interactive 2D/3D Blueprint: Tap-to-pin defects on exact chassis mesh coordinates.",
        "Real-Time Telemetry: Live WebSocket pushes alert line leads instantly on defect spikes.",
        "Closed-Loop Rework: Ishikawa 6M analysis and QA re-inspection sign-off before release."
    ], CYAN_ACCENT)

    add_card(s2, Inches(8.8), Inches(2.0), Inches(3.6), Inches(4.8), "Measurable Business Value", [
        "First Time Quality (FTQ): Drives FTQ rates above 95.0% through immediate containment.",
        "DPU & DPMO Reduction: Tracks defect density across all vehicle sub-assemblies.",
        "Cycle Time Optimization: Reduces rework bay bottleneck duration by over 30%.",
        "Audit Readiness: Full digital audit trails compliant with IATF 16949 quality standards."
    ], EMERALD)

    # -------------------------------------------------------------
    # SLIDE 3: System Architecture & Technology Stack
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Architecture", "Full-Stack System Architecture & Technology Matrix",
               "High-performance, event-driven architecture designed for high-throughput automotive manufacturing")

    add_card(s3, Inches(0.8), Inches(2.0), Inches(2.7), Inches(4.8), "Frontend Layer", [
        "React 18 + TypeScript",
        "Vite 5 for instant HMR",
        "Tailwind CSS Dark Cockpit UI",
        "Recharts SPC & Pareto charts",
        "SVG Chassis Vector Blueprint",
        "WebSocket Auto-Reconnect"
    ], CYAN_ACCENT)

    add_card(s3, Inches(3.8), Inches(2.0), Inches(2.7), Inches(4.8), "Backend REST API", [
        "Node.js + Express.js",
        "TypeScript with Strict Typing",
        "Zod DTO Schema Validation",
        "WebSocket Server (/ws)",
        "Layered Service Architecture",
        "Single-Host Static SPA Serving"
    ], CYAN_ACCENT)

    add_card(s3, Inches(6.8), Inches(2.0), Inches(2.7), Inches(4.8), "Persistence & Cache", [
        "PostgreSQL 16 Relational DB",
        "Indexes on VIN, Status, Line",
        "Redis 7 Query Caching (TTL)",
        "Redis Pub/Sub Telemetry",
        "Automatic Resilient In-Memory Fallback Engine"
    ], AMBER)

    add_card(s3, Inches(9.8), Inches(2.0), Inches(2.7), Inches(4.8), "DevOps & Cloud", [
        "Docker Multi-Stage Builds",
        "Docker Compose Orchestration",
        "Nginx Reverse Proxy & Static Cache",
        "GitHub Actions CI/CD Pipeline",
        "Automated TypeCheck & Lint"
    ], EMERALD)

    # -------------------------------------------------------------
    # SLIDE 4: Digital Workstation Inspection Workflows
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Inspection Gates", "Workstation Quality Gates & Inspection Workflows",
               "Configurable digital checklists validating nominal tolerances and sensor measurements")

    add_card(s4, Inches(0.8), Inches(2.0), Inches(3.6), Inches(4.8), "Body Shop & Stamping (BIW)", [
        "WS-101 Robotic Weld Geometry: B-Pillar structural laser weld continuity.",
        "Shear Resistance Test: Spot welds tested to >= 4.5 kN pull resistance.",
        "WS-102 Gap & Flushness: Fender-to-door gap nominal 3.5mm ± 0.5mm.",
        "Optical 3D Scanners: Detects subframe coordinate deviations."
    ], CYAN_ACCENT)

    add_card(s4, Inches(4.8), Inches(2.0), Inches(3.6), Inches(4.8), "Paint & Surface Coating", [
        "WS-201 E-Coat Thickness: Cathodic dip dry film gauge (22 µm nominal).",
        "WS-202 Clearcoat Optical Scan: Orange-peel Distinction of Image (DOI >= 92).",
        "Surface Inclusions: Optical check for micro-blisters, runs, and sags.",
        "Spectrophotometer: Delta-E color variance against master standard (ΔE <= 0.6)."
    ], CYAN_ACCENT)

    add_card(s4, Inches(8.8), Inches(2.0), Inches(3.6), Inches(4.8), "Powertrain & Final Trim", [
        "WS-301 HV Battery Enclosure: IP69K helium leak rate containment check.",
        "Chassis Fastening Torque: M10 structural bolts recorded to 65 Nm ± 5 Nm.",
        "WS-401 ADAS Sensor Calibration: Forward camera pitch (0.0° ± 0.15°).",
        "WS-402 Dyno & Water Chamber: 120 bar monsoonal water ingress chamber."
    ], EMERALD)

    # -------------------------------------------------------------
    # SLIDE 5: 2D/3D Vehicle Inspection Blueprint & Pinning
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Chassis Pin-Marker", "Interactive 2D/3D Vehicle Blueprint & Defect Marker",
               "Visual spatial defect localization with crosshair mesh coordinates")

    add_card(s5, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.8), "Multi-Angle Visual Wireframe Mesh", [
        "Top View: Hood, Windshield, Panoramic Roof Glass, Battery Subframe perimeter, Trunk.",
        "Side Profile: Driver/Passenger Doors, A/B/C Pillars, Rocker Panels, Wheel Arches.",
        "Front Fascia: Bumper Lip Splitter, Headlamp housings, Radiator/Inverter Grille.",
        "Rear View: Tailgate Latch, LED Lightbar, Rear Bumper Diffuser.",
        "Click-to-Pin Crosshairs: Tapping on any chassis zone registers exact percentage coordinates (X, Y).",
        "Automated Zone Classification: Maps coordinates to Hood, Doors, Battery Pack, etc."
    ], CYAN_ACCENT)

    add_card(s5, Inches(6.8), Inches(2.0), Inches(5.6), Inches(4.8), "Real-Time Telemetry & Radar Markers", [
        "Critical Safety Hold (Red Ping): Flashing radar ping requires QA Director containment.",
        "Major Functional Defect (Amber): Fastener torque deviations, optical sensor offsets.",
        "Minor Cosmetic Flaw (Cyan): Clearcoat dust speck, micro-scratches on rocker panel.",
        "Interactive Pin Hover Cards: Displays Defect ID, inspector name, timestamp, and notes.",
        "Instant Defect Modal: Capture photo attachments, shift code, and operator badges.",
        "Direct Rework Bay Routing: One-click handoff to rework bay technicians."
    ], AMBER)

    # -------------------------------------------------------------
    # SLIDE 6: Rework Management & Ishikawa 6M RCA
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Rework Operations", "Closed-Loop Rework Bay & Ishikawa 6M Root Cause Analysis",
               "5-Why problem-solving, Cost of Poor Quality (COPQ) tracking, and QA verification sign-off")

    add_card(s6, Inches(0.8), Inches(2.0), Inches(3.6), Inches(4.8), "Ishikawa 6M Classification", [
        "Machine: Robotic nozzle wear, weld gun tip erosion, pneumatic pressure drift.",
        "Method: Torque sequencing ambiguity, incorrect SOP curing cycle.",
        "Man: Technician fatigue, manual seal roller angle misalignment.",
        "Material: Supplier batch porosity, primer batch viscosity variation.",
        "Measurement: Optical camera glare, torque transducer calibration drift.",
        "Environment: Paint booth humidity and thermal curing swings."
    ], AMBER)

    add_card(s6, Inches(4.8), Inches(2.0), Inches(3.6), Inches(4.8), "5-Why & Corrective Actions", [
        "Structured Investigation: Forces root cause identification rather than quick surface fixes.",
        "Containment Action: Immediate isolation of sister batch chassis on the line.",
        "Parts Replacement Tracking: Logs specific part numbers, seal rings, or fasteners used.",
        "Cycle Time Tracking: Monitors total technician repair minutes per rework order."
    ], CYAN_ACCENT)

    add_card(s6, Inches(8.8), Inches(2.0), Inches(3.6), Inches(4.8), "COPQ & QA Sign-Off", [
        "Cost of Poor Quality (COPQ): Quantifies exact labor cost plus scrapped materials in USD.",
        "QA Certification Gate: Re-inspected before vehicle can exit quality hold.",
        "Sign-off Protocol: Verified Pass releases chassis; Fail redirects to Re-Rework.",
        "Continuous Improvement: Data feeds plant weekly Six Sigma containment reviews."
    ], EMERALD)

    # -------------------------------------------------------------
    # SLIDE 7: Statistical Process Control (SPC) & Trends
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "SPC & Analytics", "Production Quality Trends & Statistical Process Control",
               "Executive and QA leadership dashboards tracking yield, defect Pareto, and process capability")

    add_card(s7, Inches(0.8), Inches(2.0), Inches(3.6), Inches(4.8), "Yield & Defect Density", [
        "First Time Quality (FTQ %): Real-time percentage of vehicles passing without any rework.",
        "Defects Per Unit (DPU): Average defect count per vehicle on the assembly line.",
        "Defects Per Million (DPMO): Normalized metric benchmarked against world-class standards.",
        "Hourly Pacing: Shift run-rate charts comparing real-time output against 95.0% target."
    ], CYAN_ACCENT)

    add_card(s7, Inches(4.8), Inches(2.0), Inches(3.6), Inches(4.8), "Pareto 80/20 Analysis", [
        "Dual-Axis Visualization: Defect frequency bar chart plus cumulative percentage curve.",
        "80% Cutoff Threshold: Pinpoints the 20% of defect causes driving 80% of plant rework.",
        "Root Cause Targeting: Paint blisters, torque angle drift, and panel gap out-of-spec.",
        "Dynamic Filtering: Filter by shift, vehicle model, or individual assembly line."
    ], AMBER)

    add_card(s7, Inches(8.8), Inches(2.0), Inches(3.6), Inches(4.8), "Process Capability (Cp / Cpk)", [
        "Statistical Control: Continuous monitoring against Upper and Lower Specification Limits.",
        "Cp (Process Potential): Measures process spread vs specification width (Cp = 1.67).",
        "Cpk (Process Capability): Measures how centered the process mean is (Cpk = 1.52).",
        "Vehicle Zone Heatmap: Density breakdown across Hood, Doors, Battery Pack, and Diffuser."
    ], EMERALD)

    # -------------------------------------------------------------
    # SLIDE 8: Deployment & Unified Single Localhost
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Deployment & DevOps", "Unified Localhost, Docker Compose & GitHub Actions",
               "Seamless developer experience and enterprise container deployment")

    add_card(s8, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.8), "Unified Single Localhost (Port 5000)", [
        "Single URL Execution: Frontend SPA, REST API, and WebSockets hosted on http://localhost:5000.",
        "Zero-Friction Startup: Single command 'npm start' or double-click 'start-single-host.bat'.",
        "Resilient Embedded Fallback: Runs instantly out-of-the-box with full seed data even before Postgres/Redis containers are started.",
        "Clean Proxying: Relative API calls (/api/*) and WebSocket (/ws) eliminate cross-origin complexity."
    ], CYAN_ACCENT)

    add_card(s8, Inches(6.8), Inches(2.0), Inches(5.6), Inches(4.8), "Production Docker & GitHub CI/CD", [
        "Docker Compose: Multi-tier orchestration of PostgreSQL 16, Redis 7, Express API, and Nginx.",
        "Healthcheck Dependencies: Service startup sequencing ensures DB is healthy before API boots.",
        "Volume Persistence: Named volumes ensure quality telemetry persists across container restarts.",
        "GitHub Actions Workflow: Automated TypeScript typecheck, Vite build, and Docker build matrix validation on push."
    ], EMERALD)

    # Save presentation
    output_path = "c:\\Users\\Dadit\\Desktop\\automotive\\ApexQA_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    create_deck()
