#!/usr/bin/env python3
"""
Package 8: Release Candidate Design Audit — Phase 2 Batch Fix Script
Covers: Visual consistency, responsive, accessibility, performance (automatable fixes)
"""

import re, os, glob

SRC = "/home/z/my-project/construct-os/frontend/src"

def read(path):
    with open(path, "r") as f:
        return f.read()

def write(path, content):
    with open(path, "w") as f:
        f.write(content)

def get_files():
    return glob.glob(os.path.join(SRC, "**/*.tsx"), recursive=True) + \
           glob.glob(os.path.join(SRC, "**/*.ts"), recursive=True)

files = get_files()
stats = {"visual": 0, "responsive": 0, "a11y": 0, "perf": 0}

for fpath in files:
    original = read(fpath)
    content = original
    fname = os.path.basename(fpath)
    fdir = os.path.basename(os.path.dirname(fpath))
    rel = fpath.replace(SRC + "/", "")
    changes = []

    # ============================================================
    # CATEGORY 1: VISUAL CONSISTENCY FIXES
    # ============================================================

    # 1a. rounded-12 → rounded-input on form inputs (not on cards/panels)
    if "<input" in content:
        # On input elements specifically, replace rounded-12 → rounded-input
        def fix_input_radius(m):
            tag = m.group(0)
            if "rounded-12" in tag:
                tag = tag.replace("rounded-12", "rounded-input")
                return tag
            return m.group(0)
        new_content = re.sub(r'<input[^>]*>', fix_input_radius, content)
        if new_content != content:
            changes.append("rounded-12→rounded-input on inputs")
            content = new_content
            stats["visual"] += 1

    # 1b. shadow-soft → shadow-surface (everywhere)
    if "shadow-soft" in content:
        content = content.replace("shadow-soft", "shadow-surface")
        changes.append("shadow-soft→shadow-surface")
        stats["visual"] += 1

    # 1c. purple-400 → info (in classNames only, not in tailwind config)
    if "purple-400" in content and "tailwind.config" not in fpath:
        content = content.replace("text-purple-400", "text-info")
        content = content.replace("bg-purple-400/10", "bg-info/10")
        content = content.replace("border-purple-400", "border-info")
        changes.append("purple-400→info token")
        stats["visual"] += 1

    # 1d. green-400 → success (in classNames only)
    if "green-400" in content and "tailwind.config" not in fpath:
        content = content.replace("text-green-400", "text-success")
        content = content.replace("bg-green-400", "bg-success")
        changes.append("green-400→success token")
        stats["visual"] += 1

    # 1e. Section headings: text-body-lg font-semibold → text-h3 (only in <h3> tags)
    if 'className="text-body-lg font-semibold"' in content or "className='text-body-lg font-semibold'" in content:
        # Only replace when inside <h3> tags
        def fix_h3_heading(m):
            tag = m.group(0)
            if "text-body-lg font-semibold" in tag:
                tag = tag.replace("text-body-lg font-semibold", "text-h3")
                return tag
            return m.group(0)
        new_content = re.sub(r'<h3[^>]*className="[^"]*text-body-lg font-semibold[^"]*"[^>]*>', fix_h3_heading, content)
        if new_content == content:
            new_content = re.sub(r"<h3[^>]*className='[^']*text-body-lg font-semibold[^']*'[^>]*>", fix_h3_heading, content)
        if new_content != content:
            changes.append("text-body-lg→text-h3 in h3 headings")
            content = new_content
            stats["visual"] += 1

    # 1f. text-display in sub-pages → text-h2 (TreasuryHeader, OverviewPage)
    if rel == "components/treasury/TreasuryHeader.tsx" and 'text-display' in content:
        content = content.replace('text-display', 'text-h2')
        changes.append("text-display→text-h2 in TreasuryHeader")
        stats["visual"] += 1
    if rel == "components/intelligence/pages/OverviewPage.tsx" and 'text-display' in content:
        content = content.replace('text-display', 'text-h2')
        changes.append("text-display→text-h2 in OverviewPage")
        stats["visual"] += 1

    # 1g. rounded-t-xl → rounded-t-card
    if "rounded-t-xl" in content:
        content = content.replace("rounded-t-xl", "rounded-t-card")
        changes.append("rounded-t-xl→rounded-t-card")
        stats["visual"] += 1

    # 1h. Table cell py-4 → py-3 in hand-built tables
    # Only in specific files that have hand-built tables (not the Table component)
    handbuilt_table_files = [
        "components/dashboard/RecentLedger.tsx",
        "components/intelligence/RiskMatrixTable.tsx",
        "components/intelligence/pages/AllocationPage.tsx",
        "components/intelligence/pages/RiskEnginePage.tsx",
    ]
    if rel in handbuilt_table_files and "<td" in content:
        def fix_td_padding(m):
            tag = m.group(0)
            if 'py-4' in tag:
                tag = tag.replace('py-4', 'py-3')
                return tag
            return m.group(0)
        new_content = re.sub(r'<td[^>]*>', fix_td_padding, content)
        if new_content != content:
            changes.append("table py-4→py-3")
            content = new_content
            stats["visual"] += 1

    # 1i. Icon size={24} → size={20} in CONTENT components (not navigation/chrome)
    nav_chrome_files = [
        "components/layout/Sidebar.tsx",
        "components/layout/TopBar.tsx",
        "components/layout/NavigationItem.tsx",
    ]
    if rel not in nav_chrome_files and "size={24}" in content:
        # Don't change size={24} in EmptyState (hero icons) or Skeleton patterns
        if "EmptyState" not in fname and "empty" not in fname.lower():
            content = content.replace("size={24}", "size={20}")
            changes.append("size={24}→size={20}")
            stats["visual"] += 1

    # 1j. Remove double spaces in classNames
    if "  " in content:
        # Only in className strings, not in code
        def fix_double_spaces(m):
            s = m.group(0)
            # Fix double spaces within className strings
            if 'className="' in s or "className='" in s:
                s = re.sub(r'(?<="[^"]*)  (?=[^"]*")', ' ', s)
                s = re.sub(r"(?<='[^']*)  (?=[^']*')", ' ', s)
            return s
        # Simpler: just replace '  ' with ' ' within lines containing className
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if 'className' in line:
                line = re.sub(r'  +', ' ', line)
            new_lines.append(line)
        new_content = '\n'.join(new_lines)
        if new_content != content:
            changes.append("double spaces in classNames")
            content = new_content
            stats["visual"] += 1

    # 1k. Form buttons: px-6 py-3 rounded-12 → btn-primary or px-4 py-3 rounded-btn
    # Replace inline button styles with btn-primary class
    def fix_form_button(m):
        tag = m.group(0)
        if "rounded-12" in tag and ("bg-primary" in tag or "bg-blue" in tag):
            # Extract the existing content between > and </button>
            tag = tag.replace("rounded-12", "rounded-btn")
            tag = re.sub(r'px-6', 'px-4', tag)
            return tag
        return m.group(0)
    new_content = re.sub(r'<button[^>]*rounded-12[^>]*>.*?</button>', fix_form_button, content, flags=re.DOTALL)
    if new_content != content:
        changes.append("button rounded-12→rounded-btn, px-6→px-4")
        content = new_content
        stats["visual"] += 1

    # 1l. SystemPage fixes: rounded-8 → rounded-card, h-3 → h-2, bg-border-main → bg-elevated for progress
    if rel == "pages/SystemPage.tsx":
        if "rounded-8" in content:
            content = content.replace("rounded-8", "rounded-card")
            changes.append("SystemPage rounded-8→rounded-card")
            stats["visual"] += 1
        # Fix progress bars in SystemPage
        def fix_system_progress(m):
            tag = m.group(0)
            if 'bg-border-main' in tag and 'rounded-full' in tag:
                tag = tag.replace('bg-border-main', 'bg-elevated')
            return tag
        new_content = re.sub(r'<div[^>]*bg-border-main[^>]*rounded-full[^>]*h-3[^>]*>', fix_system_progress, content)
        if new_content != content:
            changes.append("SystemPage progress bg-border-main→bg-elevated")
            content = new_content
            stats["visual"] += 1

    # 1m. TopBar h2 with text-h3 → make it semantically correct: h2 with text-h2
    if rel == "components/layout/TopBar.tsx":
        content = content.replace('<h2 className="text-h3', '<h2 className="text-h2')
        changes.append("TopBar text-h3→text-h2 on h2")
        stats["visual"] += 1

    # 1n. TreasuryHeader rounded-full on status pill → rounded-badge
    if rel == "components/treasury/TreasuryHeader.tsx":
        content = content.replace("rounded-full", "rounded-badge")
        changes.append("TreasuryHeader rounded-full→rounded-badge")
        stats["visual"] += 1

    # ============================================================
    # CATEGORY 2: RESPONSIVE FIXES
    # ============================================================

    # 2a. Remove double-padding from pages (AppShell already has p-6)
    double_pad_pages = [
        "pages/TreasuryPage.tsx",
        "pages/IntelligencePage.tsx",
        "pages/ProjectDetailPage.tsx",
    ]
    if rel in double_pad_pages:
        # Remove page-level p-4 lg:p-8 — keep content without outer padding
        content = re.sub(r'\s*className="p-4 lg:p-8"', '', content)
        changes.append("removed double padding (AppShell provides p-6)")
        stats["responsive"] += 1

    # 2b. Add flex-wrap to PageHeader
    if rel == "components/layout/PageHeader.tsx":
        content = content.replace(
            'flex items-center justify-between mb-6',
            'flex flex-wrap items-center justify-between gap-4 mb-6'
        )
        changes.append("PageHeader: added flex-wrap")
        stats["responsive"] += 1

    # 2c. Fix ProjectDetailPage header: add flex-wrap and responsive stack
    if rel == "pages/ProjectDetailPage.tsx":
        content = content.replace(
            'flex items-start justify-between mb-8',
            'flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8'
        )
        changes.append("ProjectDetail header: responsive flex-wrap")
        stats["responsive"] += 1

    # 2d. Fix SettlementsPage rows: stack on mobile
    if rel == "pages/SettlementsPage.tsx":
        # Fix the settlement card row to stack
        content = content.replace(
            'flex items-center justify-between',
            'flex flex-col sm:flex-row sm:items-center justify-between gap-3'
        )
        # Fix text-right → sm:text-right
        content = content.replace(
            'className="text-right"',
            'className="sm:text-right text-left"'
        )
        changes.append("SettlementsPage: responsive stacking")
        stats["responsive"] += 1

    # 2e. Fix NewProjectPage milestone budget input: w-40 → w-full sm:w-40
    if rel == "pages/NewProjectPage.tsx":
        content = content.replace(
            'className="w-40 bg-surface',
            'className="w-full sm:w-40 bg-surface'
        )
        changes.append("NewProjectPage: responsive budget input")
        stats["responsive"] += 1

    # 2f. Fix skeleton grid in ProjectDetailPage: grid-cols-4 → grid-cols-2 lg:grid-cols-4
    if rel == "pages/ProjectDetailPage.tsx":
        content = content.replace(
            'grid grid-cols-4 gap-4',
            'grid grid-cols-2 lg:grid-cols-4 gap-4'
        )
        changes.append("ProjectDetail skeleton: responsive grid")
        stats["responsive"] += 1

    # 2g. Touch target fixes: p-2 on icon-only buttons → p-3 (minimum 44px)
    # Files with known small touch targets
    touch_target_fixes = {
        "components/ui/CopyButton.tsx": [("p-2 text-text-dim", "p-3 text-text-dim")],
        "components/ui/Toast.tsx": [("p-1 text-text-dim", "p-2.5 text-text-dim")],
        "components/ui/Drawer.tsx": [("p-2 text-text-dim", "p-3 text-text-dim")],
        "components/layout/TopBar.tsx": [
            ("p-2 text-text-muted", "p-2.5 text-text-muted"),  # notification bell
        ],
        "components/treasury/TreasuryHeader.tsx": [
            ("p-2 text-text-muted", "p-3 text-text-muted"),
        ],
        "components/ledger/LedgerToolbar.tsx": [
            ("p-2 text-text-muted", "p-3 text-text-muted"),
        ],
    }
    if rel in touch_target_fixes:
        for old, new in touch_target_fixes[rel]:
            if old in content:
                content = content.replace(old, new)
                changes.append(f"touch target: {old[:15]}...→{new[:15]}...")
                stats["responsive"] += 1

    # 2h. Fix NewProjectPage trash button: add padding
    if rel == "pages/NewProjectPage.tsx":
        content = content.replace(
            'className="text-text-dim hover:text-danger transition-colors"',
            'className="p-3 text-text-dim hover:text-danger transition-colors"'
        )
        changes.append("NewProjectPage trash button: added p-3")
        stats["responsive"] += 1

    # 2i. CommandCenter action buttons: py-2 → py-3
    if rel == "components/dashboard/CommandCenter.tsx":
        content = content.replace("px-3 py-2", "px-4 py-3")
        changes.append("CommandCenter: touch target py-2→py-3")
        stats["responsive"] += 1

    # 2j. MilestoneTimeline action buttons: py-2 → py-3
    if rel == "components/project/MilestoneTimeline.tsx":
        content = content.replace("px-4 py-2", "px-4 py-3")
        changes.append("MilestoneTimeline: touch target py-2→py-3")
        stats["responsive"] += 1

    # 2k. TopBar avatar: w-9 h-9 → w-11 h-11 (44px)
    if rel == "components/layout/TopBar.tsx":
        content = content.replace("w-9 h-9", "w-11 h-11")
        changes.append("TopBar avatar: w-9→w-11 (44px)")
        stats["responsive"] += 1

    # 2l. Intelligence Overview KPI grid: grid-cols-2 → grid-cols-1 sm:grid-cols-2
    if rel == "components/intelligence/pages/OverviewPage.tsx":
        content = content.replace(
            "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
            "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
        )
        changes.append("Overview KPI grid: added grid-cols-1 for smallest screens")
        stats["responsive"] += 1

    # 2m. RegisterDrawer: grid-cols-2 → grid-cols-1 sm:grid-cols-2
    if rel == "components/contractors/RegisterDrawer.tsx":
        content = content.replace(
            "grid grid-cols-2 gap-4",
            "grid grid-cols-1 sm:grid-cols-2 gap-4"
        )
        changes.append("RegisterDrawer: responsive grid-cols")
        stats["responsive"] += 1

    # 2n. Toast width: w-80 → w-80 max-w-[calc(100vw-3rem)]
    if rel == "components/ui/Toast.tsx":
        content = content.replace(
            'className="w-80',
            'className="w-80 max-w-[calc(100vw-3rem)]'
        )
        changes.append("Toast: max-width constraint")
        stats["responsive"] += 1

    # 2o. EventDetailDrawer tx hash: add break-all
    if rel == "components/ledger/EventDetailDrawer.tsx":
        content = content.replace(
            'className="font-mono text-primary text-caption"',
            'className="font-mono text-primary text-caption break-all"'
        )
        changes.append("EventDetailDrawer: tx hash break-all")
        stats["responsive"] += 1

    # ============================================================
    # CATEGORY 3: ACCESSIBILITY FIXES (automatable)
    # ============================================================

    # 3a. Drawer backdrop: add aria-hidden="true"
    if rel == "components/ui/Drawer.tsx":
        content = content.replace(
            'className="dialog-backdrop" onClick={onClose} />',
            'className="dialog-backdrop" onClick={onClose} aria-hidden="true" />'
        )
        changes.append("Drawer backdrop: aria-hidden")
        stats["a11y"] += 1

    # 3b. NavigationItem: add aria-label={label}
    if rel == "components/layout/NavigationItem.tsx":
        content = content.replace(
            'aria-current={active ? \'page\' : undefined}',
            'aria-label={label} aria-current={active ? \'page\' : undefined}'
        )
        changes.append("NavigationItem: aria-label")
        stats["a11y"] += 1

    # 3c. Search inputs: add aria-label
    if rel == "components/ledger/LedgerToolbar.tsx":
        content = content.replace(
            'type="text" value={search}',
            'type="text" aria-label="Search ledger by TX hash or project name" value={search}'
        )
        changes.append("LedgerToolbar: search aria-label")
        stats["a11y"] += 1

    if rel == "components/portfolio/PortfolioFilters.tsx":
        content = content.replace(
            'type="text" value={search}',
            'type="text" aria-label="Search projects" value={search}'
        )
        changes.append("PortfolioFilters: search aria-label")
        stats["a11y"] += 1

    # 3d. Toast ARIA: fix conflicting role="alert" + aria-live="polite"
    if rel == "components/ui/Toast.tsx":
        content = content.replace(
            'role="alert" aria-live="polite"',
            'role="status" aria-live="polite"'
        )
        changes.append("Toast: role=alert→status (fixed conflict)")
        stats["a11y"] += 1

    # 3e. Skeleton: add aria-hidden="true"
    if rel == "components/ui/Skeleton.tsx":
        content = content.replace(
            'className={`skeleton-shimmer rounded-8',
            'aria-hidden="true" className={`skeleton-shimmer rounded-8'
        )
        changes.append("Skeleton: aria-hidden")
        stats["a11y"] += 1

    # 3f. Remove redundant role="main" from <main>
    if rel == "components/layout/AppShell.tsx":
        content = content.replace(
            '<main className="flex-1 p-6 overflow-y-auto" role="main">',
            '<main id="main-content" className="flex-1 p-6 overflow-y-auto">'
        )
        changes.append("AppShell: removed redundant role, added id for skip-nav")
        stats["a11y"] += 1

    # 3g. Remove redundant role="table" from <table>
    if rel == "components/ui/Table.tsx":
        content = content.replace(
            '<table className="w-full text-left" role="table">',
            '<table className="w-full text-left">'
        )
        changes.append("Table: removed redundant role=table")
        stats["a11y"] += 1

    # 3h. Add aria-hidden to decorative Lucide icons in key components
    # Pattern: <IconName size={...} ... /> without aria-hidden
    decorative_icon_files = {
        "components/ui/MetricCard.tsx": "Icon",
        "components/dashboard/RecentLedger.tsx": "CheckCircle",
        "components/ledger/LedgerTable.tsx": "CheckCircle",
        "components/ledger/LedgerToolbar.tsx": "Search",
        "components/portfolio/PortfolioFilters.tsx": "Search",
        "components/layout/TopBar.tsx": "Search",
        "components/project/MilestoneTimeline.tsx": None,  # multiple
        "components/project/ContractorPanel.tsx": "User",
        "components/treasury/DepositCard.tsx": None,
        "components/intelligence/ServiceStatusGrid.tsx": None,
        "components/intelligence/pages/OverviewPage.tsx": None,
        "components/ui/Toast.tsx": "Icon",
    }

    if rel in decorative_icon_files and "aria-hidden" not in content:
        # Add aria-hidden to Lucide icon components that don't have it
        # Pattern: <IconComponent size={...} ... className="..."
        def add_aria_hidden_to_icons(m):
            tag = m.group(0)
            if "aria-hidden" not in tag and "aria-label" not in tag:
                tag = tag.replace("<", "<aria-hidden='true' ", 1)
                return tag
            return m.group(0)
        # Match Lucide icon components (PascalCase, starting with capital, with size prop)
        new_content = re.sub(
            r'<[A-Z]\w+\s+size=\{[^}]+\}[^>]*/?>',
            add_aria_hidden_to_icons,
            content
        )
        # Fix the syntax: <aria-hidden='true' Icon -> <Icon aria-hidden='true'
        new_content = re.sub(
            r"<aria-hidden='true' ([A-Z]\w+)",
            r"<\1 aria-hidden='true'",
            new_content
        )
        if new_content != content:
            changes.append("decorative icons: aria-hidden='true'")
            content = new_content
            stats["a11y"] += 1

    # 3i. Intelligence tabs: aria-current="page" → aria-selected
    if rel == "pages/IntelligencePage.tsx":
        content = content.replace(
            "aria-current={activeTab === tab.id ? 'page' : undefined}",
            "role=\"tab\" aria-selected={activeTab === tab.id}"
        )
        # Add role="tablist" to tab container
        content = content.replace(
            'className="flex items-center gap-2 border-b border-border-main',
            'role="tablist" className="flex items-center gap-2 border-b border-border-main'
        )
        changes.append("Intelligence tabs: proper ARIA tab pattern")
        stats["a11y"] += 1

    # 3j. Skip-to-content link in AppShell
    if rel == "components/layout/AppShell.tsx":
        if "skip" not in content.lower() and "Skip" not in content:
            # Add skip link before the sidebar
            content = content.replace(
                '<div className="flex h-screen',
                '<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-btn focus:text-small focus:shadow-raised">Skip to main content</a>\n      <div className="flex h-screen'
            )
            changes.append("AppShell: skip-to-content link")
            stats["a11y"] += 1

    # 3k. PortfolioPanel: make project items keyboard accessible
    if rel == "components/dashboard/PortfolioPanel.tsx":
        # Add role, tabIndex, onKeyDown to the clickable div
        content = content.replace(
            'className="... cursor-pointer group"\n          onClick={() => onSelectProject(p.id)}',
            'role="button" tabIndex={0} className="... cursor-pointer group"\n          onClick={() => onSelectProject(p.id)}\n          onKeyDown={(e: React.KeyboardEvent) => e.key === \'Enter\' && onSelectProject(p.id)}\n          aria-label={`Open project ${p.name}`}'
        )
        # Simpler approach: find the exact pattern
        content = content.replace(
            'className="p-4 rounded-card bg-surface shadow-surface  transition-transform hover:shadow-raised cursor-pointer group"',
            'role="button" tabIndex={0} className="p-4 rounded-card bg-surface shadow-surface transition-transform hover:shadow-raised cursor-pointer group" onKeyDown={(e: React.KeyboardEvent) => e.key === \'Enter\' && onSelectProject(p.id)} aria-label={`Open project ${p.name}`}'
        )
        changes.append("PortfolioPanel: keyboard-accessible project items")
        stats["a11y"] += 1

    # 3l. NewProjectPage: add htmlFor/id to labels and inputs
    if rel == "pages/NewProjectPage.tsx":
        content = content.replace(
            '<label className="block text-small text-text-muted mb-2">Project Name</label>',
            '<label htmlFor="project-name" className="block text-small text-text-muted mb-2">Project Name</label>'
        )
        content = content.replace(
            '<label className="block text-small text-text-muted mb-2">Total Budget (USD)</label>',
            '<label htmlFor="total-budget" className="block text-small text-text-muted mb-2">Total Budget (USD)</label>'
        )
        # Add ids to the corresponding inputs
        content = content.replace(
            'placeholder="e.g. Skyline Tower"',
            'id="project-name" placeholder="e.g. Skyline Tower"'
        )
        content = content.replace(
            'placeholder="e.g. 500000"',
            'id="total-budget" placeholder="e.g. 500000"'
        )
        # Add aria-required
        content = content.replace(
            'id="project-name" placeholder',
            'id="project-name" aria-required="true" placeholder'
        )
        content = content.replace(
            'id="total-budget" placeholder',
            'id="total-budget" aria-required="true" placeholder'
        )
        # Add aria-label to milestone inputs
        content = content.replace(
            'placeholder="Phase name"',
            'aria-label="Milestone name" placeholder="Phase name"'
        )
        content = content.replace(
            'placeholder="Budget"',
            'aria-label="Milestone budget" placeholder="Budget"'
        )
        changes.append("NewProjectPage: label/input associations, aria-required")
        stats["a11y"] += 1

    # 3m. Error divs: add role="alert"
    error_pattern_files = [
        "pages/NewProjectPage.tsx",
        "components/contractors/RegisterDrawer.tsx",
        "components/treasury/DepositCard.tsx",
    ]
    if rel in error_pattern_files:
        # Find error divs with bg-danger/10 and add role="alert"
        content = re.sub(
            r'(<div className="bg-danger/10[^"]*text-danger[^"]*"[^>]*>)',
            r'\1 role="alert"',
            content
        )
        if "role=\"alert\"" in content and original.count("role=\"alert\"") < content.count("role=\"alert\""):
            changes.append("error divs: added role=alert")
            stats["a11y"] += 1

    # 3n. Notification bell: add sr-only unread text
    if rel == "components/layout/TopBar.tsx":
        content = content.replace(
            '<span className="absolute top-2 right-1.5 w-2 h-2 bg-primary rounded-full"></span>',
            '<span className="absolute top-2 right-1.5 w-2 h-2 bg-primary rounded-full"></span><span className="sr-only">1 unread</span>'
        )
        changes.append("TopBar: notification unread sr-only text")
        stats["a11y"] += 1

    # 3o. Progress bars: add role="progressbar" where missing
    # In ProgressBar.tsx component
    if rel == "components/ui/ProgressBar.tsx":
        content = content.replace(
            '<div className="w-full bg-elevated rounded-full h-2">',
            '<div className="w-full bg-elevated rounded-full h-2" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>'
        )
        changes.append("ProgressBar: role=progressbar")
        stats["a11y"] += 1

    # 3p. Table captions for hand-built tables
    table_caption_files = {
        "components/dashboard/RecentLedger.tsx": "Recent ledger entries",
        "components/intelligence/RiskMatrixTable.tsx": "Risk assessment matrix",
        "components/intelligence/CashFlowTable.tsx": "Cash flow summary",
    }
    if rel in table_caption_files:
        caption_text = table_caption_files[rel]
        content = content.replace(
            "<table",
            f'<caption className="sr-only">{caption_text}</caption>\n        <table'
        )
        changes.append(f"table: added sr-only caption")
        stats["a11y"] += 1

    # ============================================================
    # CATEGORY 4: PERFORMANCE FIXES (automatable)
    # ============================================================

    # 4a. Cache Intl.NumberFormat in api.ts
    if rel == "lib/api.ts":
        content = content.replace(
            'export const money = (value: string | number): string => \n  new Intl.NumberFormat',
            'const _fmt = new Intl.NumberFormat(\'en-US\', { style: \'currency\', currency: \'USD\' });\nexport const money = (value: string | number): string =>\n  _fmt.format'
        )
        # Also clean up the remaining part
        content = content.replace(
            "  _fmt.format(Number(value));",
            "  _fmt.format(Number(value));"
        )
        changes.append("api.ts: cached Intl.NumberFormat")
        stats["perf"] += 1

    # 4b. Fix state mutation: ledger.sort → [...ledger].sort
    if rel == "pages/ProjectDetailPage.tsx":
        content = content.replace(
            "ledger.sort((a,b) => a.timestamp - b.timestamp)",
            "[...ledger].sort((a,b) => a.timestamp - b.timestamp)"
        )
        changes.append("ProjectDetailPage: fixed state mutation (spread before sort)")
        stats["perf"] += 1

    # 4c. Remove unused imports
    unused_imports = {
        "components/treasury/CapitalDistribution.tsx": ["import React from 'react';\n"],
        "components/treasury/TreasuryHealth.tsx": ["import React from 'react';\n"],
        "components/treasury/TreasuryHeader.tsx": [("WifiOff", "")],
        "components/treasury/TreasuryTimeline.tsx": [("Project", "")],
        "components/intelligence/ServiceStatusGrid.tsx": [("ShieldAlert", ""), ("BarChart3", "")],
        "components/intelligence/SystemActivityLog.tsx": [("money", "")],
        "components/intelligence/pages/OverviewPage.tsx": [("Database", ""), ("CheckCircle", "")],
        "components/intelligence/pages/RiskEnginePage.tsx": [("TrendingUp", ""), ("TrendingDown", "")],
        "components/layout/Sidebar.tsx": [("ChevronLeft", "")],
    }
    if rel in unused_imports:
        for removal in unused_imports[rel]:
            if isinstance(removal, tuple):
                old, new = removal
                # Remove from import: "Old, Other" → "Other", "Other, Old" → "Other"
                # Handle comma-separated imports
                if new == "":
                    # Remove the import from destructured imports
                    if f", {old}" in content:
                        content = content.replace(f", {old}", "")
                        changes.append(f"removed unused import: {old}")
                        stats["perf"] += 1
                    elif f"{old}, " in content:
                        content = content.replace(f"{old}, ", "")
                        changes.append(f"removed unused import: {old}")
                        stats["perf"] += 1
            else:
                if removal in content:
                    content = content.replace(removal, "")
                    changes.append(f"removed unused import line")
                    stats["perf"] += 1

    # 4d. Sidebar: merge duplicate transition classes
    if rel == "components/layout/Sidebar.tsx":
        content = content.replace(
            "transition-[width] duration-slow transition-timing-panel",
            "transition-[width,transform] duration-slow transition-timing-panel"
        )
        content = content.replace(
            "transition-transform duration-slow transition-timing-panel",
            ""
        )
        changes.append("Sidebar: merged duplicate transition classes")
        stats["perf"] += 1

    # 4e. Table animation delay cap
    if rel == "components/ui/Table.tsx":
        content = content.replace(
            'animationDelay: `${idx * 30}ms`',
            'animationDelay: `${Math.min(idx, 10) * 30}ms`'
        )
        changes.append("Table: capped animation stagger at 10 rows")
        stats["perf"] += 1

    # ============================================================
    # WRITE FILE IF CHANGED
    # ============================================================
    if content != original:
        write(fpath, content)

# Print summary
print("=" * 60)
print("Package 8 — Phase 2 Audit Fix Script Results")
print("=" * 60)
print(f"Files scanned: {len(files)}")
print(f"Visual consistency fixes: {stats['visual']}")
print(f"Responsive fixes: {stats['responsive']}")
print(f"Accessibility fixes: {stats['a11y']}")
print(f"Performance fixes: {stats['perf']}")
print(f"Total automatable fixes applied: {sum(stats.values())}")