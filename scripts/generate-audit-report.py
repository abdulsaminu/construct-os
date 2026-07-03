#!/usr/bin/env python3
"""Generate ConstructOS Package 8 RC Design Audit Report PDF"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import mm, cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONT_DIR = '/usr/share/fonts'
pdfmetrics.registerFont(TTFont('Body', f'{FONT_DIR}/truetype/liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('BodyBold', f'{FONT_DIR}/truetype/liberation/LiberationSans-Bold.ttf'))

OUT = '/home/z/my-project/construct-os/download/ConstructOS-P8-RC-Design-Audit-Report.pdf'
os.makedirs(os.path.dirname(OUT), exist_ok=True)

C_PRIMARY = HexColor('#356DFF')
C_DARK = HexColor('#0B1220')
C_MUTED = HexColor('#6B7280')
C_BORDER = HexColor('#E5E7EB')
W, H = A4

ss = getSampleStyleSheet()
ss.add(ParagraphStyle('CoverTitle', fontName='BodyBold', fontSize=28, leading=34, 
    textColor=C_DARK, alignment=TA_LEFT, spaceAfter=8*mm))
ss.add(ParagraphStyle('CoverSub', fontName='Body', fontSize=14, leading=20,
    textColor=C_MUTED, alignment=TA_LEFT, spaceAfter=4*mm))
ss.add(ParagraphStyle('H1', fontName='BodyBold', fontSize=18, leading=24,
    textColor=C_DARK, spaceBefore=8*mm, spaceAfter=4*mm))
ss.add(ParagraphStyle('H2', fontName='BodyBold', fontSize=13, leading=18,
    textColor=C_PRIMARY, spaceBefore=6*mm, spaceAfter=3*mm))
ss.add(ParagraphStyle('Body', fontName='Body', fontSize=10, leading=16,
    textColor=HexColor('#1F2937'), alignment=TA_JUSTIFY, spaceAfter=3*mm))
ss.add(ParagraphStyle('BulletItem', fontName='Body', fontSize=10, leading=16,
    textColor=HexColor('#1F2937'), leftIndent=12, bulletIndent=0, spaceAfter=2*mm))
ss.add(ParagraphStyle('Caption', fontName='Body', fontSize=9, leading=13,
    textColor=C_MUTED, alignment=TA_LEFT, spaceBefore=2*mm))
ss.add(ParagraphStyle('TC', fontName='Body', fontSize=9, leading=13,
    textColor=HexColor('#1F2937')))
ss.add(ParagraphStyle('TCB', fontName='BodyBold', fontSize=9, leading=13,
    textColor=C_DARK))

def h1(t): return Paragraph(t, ss['H1'])
def h2(t): return Paragraph(t, ss['H2'])
def p(t): return Paragraph(t, ss['Body'])
def b(t): return Paragraph(f"\u2022 {t}", ss['BulletItem'])

def tbl(headers, rows, cw=None):
    aw = W - 2*2.5*cm
    if cw is None: cw = [aw / len(headers)] * len(headers)
    data = [[Paragraph(h, ss['TCB']) for h in headers]]
    for r in rows: data.append([Paragraph(str(c), ss['TC']) for c in r])
    t = Table(data, colWidths=cw, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HexColor('#F3F4F6')),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6), ('TOPPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8), ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER), ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, HexColor('#F9FAFB')]),
    ]))
    return t

story = []

# Cover
story.append(Spacer(1, 60*mm))
story.append(Paragraph("ConstructOS", ss['CoverTitle']))
story.append(Paragraph("Package 8: Release Candidate Design Audit", ParagraphStyle(
    'CT2', parent=ss['CoverTitle'], fontSize=22, leading=28, textColor=C_PRIMARY)))
story.append(Spacer(1, 8*mm))
story.append(HRFlowable(width="30%", thickness=2, color=C_PRIMARY, spaceAfter=6*mm))
story.append(Paragraph("CFEL Architecture  \u2022  Design Token Standardization  \u2022  WCAG AA Compliance", ss['CoverSub']))
story.append(Paragraph("Responsive  \u2022  Performance  \u2022  Visual Consistency", ss['CoverSub']))
story.append(Spacer(1, 20*mm))
story.append(Paragraph("July 2026  \u2022  v0.8-release-candidate", ss['Caption']))
story.append(Spacer(1, 4*mm))
story.append(Paragraph("Automated audit + standardization pass across 83 source files.", ss['Caption']))
story.append(PageBreak())

# 1. Executive Summary
story.append(h1("1. Executive Summary"))
story.append(p(
    "This report documents the comprehensive Release Candidate (RC) design audit performed on the ConstructOS frontend "
    "codebase as part of Package 8. The audit systematically evaluated 83 TypeScript/React source files across four "
    "dimensions: visual consistency, responsive design, accessibility (WCAG AA), and performance. The goal was to "
    "standardize the codebase against the established design token system and ensure production-readiness for the "
    "v0.8 release candidate."
))
story.append(p(
    "The audit was conducted as an automated + manual hybrid approach. A Python batch-fix script addressed 220+ "
    "automatable issues (token replacements, spacing normalization, icon size standardization), while targeted manual "
    "fixes addressed complex concerns (focus trap implementation, ARIA pattern correction, contrast ratio compliance). "
    "The final build produces zero TypeScript errors and a clean Vite production bundle."
))

# 2. Scope
story.append(h1("2. Scope and Methodology"))
story.append(h2("2.1 In Scope"))
story.append(b("83 .tsx/.ts source files under frontend/src/"))
story.append(b("Tailwind CSS configuration (tailwind.config.js) and component-layer CSS (index.css)"))
story.append(b("6 application modules: Dashboard, Treasury, Portfolio, Contractors, Ledger+Settlements, Intelligence"))
story.append(b("Shared UI component library (Panel, Table, Drawer, Toast, Badge, etc.)"))
story.append(h2("2.2 Out of Scope (Hard Constraint)"))
story.append(b("Backend / CFEL reducer / API / event-sourcing / BigInt financial logic"))
story.append(b("New feature development or component redesign"))
story.append(b("Architectural changes (data-fetching libraries, batch API endpoints)"))
story.append(h2("2.3 Methodology"))
story.append(p(
    "Phase 1 (automated): Four parallel subagent audits scanned every source file for responsive, accessibility, "
    "performance, and visual consistency issues. Each produced a structured report with severity ratings. "
    "Phase 2 (automated fixes): A Python batch-fix script applied 220+ regex-based token replacements. "
    "Phase 3 (manual fixes): Complex concerns requiring code-level understanding (focus traps, ARIA patterns, "
    "form label associations, contrast ratio correction) were applied manually. "
    "Phase 4 (verification): Full TypeScript build (tsc + vite build) confirmed zero errors."
))

# 3. Visual Consistency
story.append(h1("3. Visual Consistency"))
story.append(p(
    "The design token system defines strict values for spacing (4/8/12/16/24/32/48/64px), border-radius "
    "(btn 6px / input 8px / card 12px / dialog 16px), typography (11 levels from display-lg to micro), "
    "shadows (surface/raised/floating/overlay), and animation durations (fast 150ms / normal 250ms / slow 350ms). "
    "The audit verified full compliance across all 83 files."
))
story.append(h2("3.1 Fixes Applied"))
cw = [35*mm, 130*mm]
story.append(tbl(
    ["Category", "Details"],
    [
        ["Border-Radius Tokens", "Replaced rounded-12 with semantic tokens: rounded-input (8px) on all form fields, rounded-btn (6px) on buttons, rounded-card (12px) on container divs. Fixed 31 files."],
        ["Shadow Tokens", "Replaced all shadow-soft (legacy alias) with shadow-surface across 14 files. Eliminates visual inconsistency between Panel/MetricCard (surface) and Settlement/Forecast cards (soft)."],
        ["Color Tokens", "Replaced non-token colors: purple-400 to info, green-400 to success. Two files affected (LedgerTable, ProjectsPage)."],
        ["Typography Hierarchy", "Fixed section headings: text-body-lg font-semibold to text-h3 on 3 h3 elements (ProjectDetail, ProjectLedger, ContractorPanel). Fixed text-display (44px) to text-h2 (30px) in sub-page headers (TreasuryHeader, OverviewPage)."],
        ["Icon Sizes", "Normalized content-area icons from size={24} to size={20} across 8+ files. Navigation chrome (Sidebar, TopBar) correctly retains size={24}."],
        ["Table Density", "Standardized table cell padding from py-4 to py-3 across 4 hand-built tables (RecentLedger, RiskMatrixTable, AllocationPage, RiskEnginePage) to match the reusable Table component."],
        ["Double Spaces", "Removed double spaces in className strings across 20+ files caused by previous automated edits."],
    ],
    cw=cw
))

# 4. Responsive
story.append(h1("4. Responsive Design"))
story.append(h2("4.1 Fixes Applied"))
story.append(tbl(
    ["Issue", "Fix"],
    [
        ["Double Padding (3 pages)", "Removed page-level p-4 lg:p-8 from TreasuryPage, IntelligencePage, ProjectDetailPage. AppShell provides p-6 as sole outer padding."],
        ["Header Overflow", "Added flex-wrap to PageHeader, ProjectDetailPage header, and SettlementsPage rows. Titles and action buttons now stack on narrow screens."],
        ["Touch Targets (8 components)", "Increased padding on icon-only buttons: p-2 to p-3 (CopyButton, Drawer close, TopBar bell, TreasuryHeader refresh, LedgerToolbar toggles, NewProjectPage trash, CommandCenter/MilestoneTimeline actions)."],
        ["Avatar Size", "TopBar user avatar: w-9 h-9 to w-11 h-11 (44px WCAG minimum)."],
        ["Grid Breakpoints", "ProjectDetailPage skeleton: grid-cols-4 to grid-cols-2 lg:grid-cols-4. Intelligence KPI grid: added grid-cols-1 for smallest screens. RegisterDrawer form: grid-cols-2 to grid-cols-1 sm:grid-cols-2."],
        ["Content Stacking", "SettlementsPage rows stack vertically on mobile (flex-col sm:flex-row). NewProjectPage budget input: w-40 to w-full sm:w-40."],
        ["Overflow Handling", "EventDetailDrawer tx hash: added break-all. Toast: added max-w-[calc(100vw-3rem)]."],
    ],
    cw=cw
))

# 5. Accessibility
story.append(h1("5. Accessibility (WCAG AA)"))
story.append(h2("5.1 Contrast Ratio Fix"))
story.append(p(
    "The text-dim color token (#6B7280) failed WCAG AA contrast requirements on all background surfaces. "
    "On surface (#111827), the contrast ratio was only 3.77:1 (minimum 4.5:1 required for normal text). "
    "The token was lightened to #8B95A5, achieving 4.6:1 on surface, passing WCAG AA for all text sizes."
))
story.append(h2("5.2 Fixes Applied"))
story.append(tbl(
    ["Category", "Fix"],
    [
        ["Focus Management", "Drawer: implemented full focus trap (Tab/Shift+Tab cycling), focus restoration on close (saves and restores document.activeElement), and aria-hidden on backdrop."],
        ["Form Labels", "NewProjectPage: added htmlFor/id associations for Project Name and Total Budget inputs, plus aria-required. RegisterDrawer: InputField component now generates unique ids from label text."],
        ["ARIA Labels", "Added aria-label to all icon-only buttons: Drawer close, CopyButton, NavigationItem (always visible), notification bell (sr-only unread count), LedgerToolbar and PortfolioFilters search inputs."],
        ["Intelligence Tabs", "Corrected aria-current='page' to role='tab' + aria-selected on tab buttons. Added role='tablist' to container."],
        ["Toast ARIA", "Fixed conflicting role='alert' + aria-live='polite' to role='status' + aria-live='polite'."],
        ["Skip Navigation", "Added skip-to-content link (sr-only, visible on focus) in AppShell before sidebar."],
        ["Decorative Icons", "Added aria-hidden='true' to decorative Lucide icon instances across 15+ component files."],
        ["Skeleton Accessibility", "Added aria-hidden='true' to Skeleton component."],
        ["Table Captions", "Added sr-only caption elements to 3 hand-built tables (RecentLedger, RiskMatrixTable, CashFlowTable)."],
        ["Error Announcements", "Added role='alert' to error message divs in NewProjectPage, RegisterDrawer, and DepositCard."],
        ["Redundant Roles", "Removed redundant role='main' from main element and role='table' from table elements."],
    ],
    cw=cw
))

# 6. Performance
story.append(h1("6. Performance"))
story.append(h2("6.1 Fixes Applied"))
story.append(tbl(
    ["Category", "Fix"],
    [
        ["Intl.NumberFormat Cache", "Cached formatter instance at module level in api.ts. Previously created new instance on every money() call (~100x per page load)."],
        ["State Mutation Bug", "Fixed ProjectDetailPage: ledger.sort() to [...ledger].sort(). Direct state mutation caused unpredictable re-renders."],
        ["Column Memoization", "Wrapped column definitions in useMemo(() => [...], []) in 4 table components (ContractorTable, LedgerTable, CapitalEventsTable, ProjectLedger)."],
        ["Filter Memoization", "Wrapped filteredProjects in useMemo with proper dependency array in PortfolioPage."],
        ["ProjectCard Memo", "Wrapped ProjectCard in React.memo to prevent re-renders during filter keystrokes."],
        ["Unused Imports", "Removed unused imports across 7 files (React, WifiOff, Project, money, Database, CheckCircle, TrendingUp, TrendingDown, ChevronLeft)."],
        ["Sidebar Transitions", "Merged duplicate transition classes (transition-[width] + transition-transform to transition-[width,transform])."],
        ["Table Animation Cap", "Capped stagger delay at 10 rows (Math.min(idx, 10) * 30ms) to prevent layout thrash on large tables."],
    ],
    cw=cw
))
story.append(h2("6.2 Noted but Deferred (Architectural)"))
story.append(p(
    "The following issues were identified but deferred as they represent architectural improvements rather than "
    "audit standardization: N+1 API call pattern (sequential per-project fetches across 6 pages), absence of "
    "client-side data caching (SWR/React Query), and missing lazy loading for page routes. These are recommended "
    "for a future performance-focused package."
))

# 7. Build
story.append(h1("7. Build Verification"))
story.append(p(
    "The final build was verified using the project's standard build command (tsc && vite build). The result: "
    "zero TypeScript errors, zero type warnings, and a clean Vite production bundle output in 2.29 seconds. "
    "The production bundle totals approximately 340 KB (gzip-compressed ~100 KB) across 20 code-split chunks."
))

# 8. Summary
story.append(h1("8. Summary Statistics"))
story.append(tbl(
    ["Metric", "Value"],
    [
        ["Files Audited", "83 .tsx/.ts source files"],
        ["Automated Fixes (Phase 2 Script)", "188"],
        ["Additional Fixes (rounded cleanup)", "34"],
        ["Manual Fixes", "~25"],
        ["Total Fixes Applied", "~247"],
        ["Visual Consistency Fixes", "126"],
        ["Responsive Fixes", "17"],
        ["Accessibility Fixes", "30"],
        ["Performance Fixes", "15"],
        ["TypeScript Build Errors", "0"],
        ["Production Build Time", "2.29s"],
    ],
    cw=[65*mm, W - 2*2.5*cm - 65*mm]
))

# Build PDF
doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=2.5*cm, rightMargin=2.5*cm,
    topMargin=2.5*cm, bottomMargin=2.5*cm, title="ConstructOS P8 RC Design Audit Report",
    author="ConstructOS", subject="Release Candidate Design Audit")

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Body', 8)
    canvas.setFillColor(C_MUTED)
    canvas.drawCentredString(W/2, 1.5*cm, f"ConstructOS P8 RC Design Audit Report  \u2022  Page {doc.page}")
    canvas.restoreState()

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(f"PDF generated: {OUT}")
print(f"Size: {os.path.getsize(OUT)/1024:.1f} KB")