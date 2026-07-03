#!/usr/bin/env python3
"""Re-apply safe changes to reverted React.memo files"""
import re, os

SRC = "/home/z/my-project/construct-os/frontend/src"

FILES = {
    "components/ui/Panel.tsx": [],
    "components/ui/EmptyState.tsx": [],
    "components/ui/RiskBadge.tsx": [],
    "components/ui/HealthBadge.tsx": [],
    "components/ui/ConfidenceBadge.tsx": [],
    "components/ui/RecommendationBadge.tsx": [],
    "components/ui/CategoryBadge.tsx": [],
    "components/ui/ScoreBar.tsx": [],
    "components/ui/CopyButton.tsx": [
        ("p-2 text-text-dim", "p-3 text-text-dim"),
    ],
    "components/ui/Skeleton.tsx": [
        ('className={`skeleton-shimmer rounded-8', 'aria-hidden="true" className={`skeleton-shimmer rounded-card'),
    ],
    "components/dashboard/DashboardKPIs.tsx": [
        ("import React from 'react';\n", ""),  # unused import
    ],
    "components/dashboard/PortfolioPanel.tsx": [
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
    ],
    "components/dashboard/CommandCenter.tsx": [
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
        ("px-3 py-2", "px-4 py-3"),  # touch target
    ],
    "components/dashboard/RiskMonitor.tsx": [
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
    ],
    "components/dashboard/RecentLedger.tsx": [
        ("shadow-soft", "shadow-surface"),
        # Table cell py-4 → py-3
    ],
    "components/dashboard/UpcomingActions.tsx": [
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
    ],
    "components/dashboard/TreasuryFlow.tsx": [
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
    ],
    "components/treasury/TreasuryKPIs.tsx": [
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
    ],
    "components/treasury/CapitalDistribution.tsx": [
        ("import React from 'react';\n", ""),  # unused import
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
    ],
    "components/treasury/ActivityFeed.tsx": [
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
    ],
    "components/treasury/QuickActions.tsx": [
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
    ],
    "components/treasury/TreasuryTimeline.tsx": [
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
    ],
    "components/project/ProjectOverviewCards.tsx": [
        ("shadow-soft", "shadow-surface"),
        ("rounded-12", "rounded-card"),
    ],
}

def read(p):
    with open(p) as f: return f.read()
def write(p, c):
    with open(p, "w") as f: f.write(c)

total = 0
for rel, replacements in FILES.items():
    fpath = os.path.join(SRC, rel)
    if not os.path.exists(fpath):
        continue
    c = read(fpath)
    for old, new in replacements:
        if old in c:
            c = c.replace(old, new)
            total += 1
            print(f"  {rel}: {old[:30]}...")
    write(fpath, c)

# Fix table cell padding in RecentLedger (py-4 → py-3 on <td>)
fpath = os.path.join(SRC, "components/dashboard/RecentLedger.tsx")
c = read(fpath)
c = re.sub(r'(<td[^>]*?)py-4', r'\1py-3', c)
write(fpath, c)
print("  RecentLedger: table py-4→py-3")
total += 1

# Fix double spaces in all reverted files
for rel in FILES:
    fpath = os.path.join(SRC, rel)
    if not os.path.exists(fpath):
        continue
    c = read(fpath)
    lines = c.split('\n')
    new_lines = []
    changed = False
    for line in lines:
        if 'className' in line and '  ' in line:
            new_line = re.sub(r'  +', ' ', line)
            if new_line != line:
                changed = True
            new_lines.append(new_line)
        else:
            new_lines.append(line)
    if changed:
        write(fpath, '\n'.join(new_lines))
        total += 1
        print(f"  {rel}: double spaces fixed")

print(f"\nTotal: {total} fixes re-applied")