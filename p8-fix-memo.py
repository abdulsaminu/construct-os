#!/usr/bin/env python3
"""Fix broken React.memo wrapping from previous script"""
import re, os, glob

SRC = "/home/z/my-project/construct-os/frontend/src"
BROKEN_FILES = [
    "components/ui/Panel.tsx",
    "components/ui/EmptyState.tsx",
    "components/ui/RiskBadge.tsx",
    "components/ui/HealthBadge.tsx",
    "components/ui/ConfidenceBadge.tsx",
    "components/ui/RecommendationBadge.tsx",
    "components/ui/CategoryBadge.tsx",
    "components/ui/ScoreBar.tsx",
    "components/ui/Skeleton.tsx",
    "components/dashboard/DashboardKPIs.tsx",
    "components/dashboard/PortfolioPanel.tsx",
    "components/dashboard/CommandCenter.tsx",
    "components/dashboard/RiskMonitor.tsx",
    "components/dashboard/RecentLedger.tsx",
    "components/dashboard/UpcomingActions.tsx",
    "components/dashboard/TreasuryFlow.tsx",
    "components/treasury/TreasuryKPIs.tsx",
    "components/treasury/CapitalDistribution.tsx",
    "components/treasury/ActivityFeed.tsx",
    "components/treasury/QuickActions.tsx",
    "components/treasury/TreasuryTimeline.tsx",
    "components/project/ProjectOverviewCards.tsx",
    "components/ui/CopyButton.tsx",
]

def read(p):
    with open(p) as f: return f.read()
def write(p, c):
    with open(p, "w") as f: f.write(c)

fixed = 0
for rel in BROKEN_FILES:
    fpath = os.path.join(SRC, rel)
    if not os.path.exists(fpath):
        continue
    c = read(fpath)
    
    # Check if file has broken React.memo pattern
    if "React.memo" not in c:
        continue
    
    # Pattern 1: export const X = React.memo({...}); => (
    # Should be: export const X = React.memo(({...}) => (
    m = re.search(r'(export const \w+ = React\.memo\()(\{[^}]*\})(\); => \()', c)
    if m:
        c = c.replace(m.group(0), f"{m.group(1)}({m.group(2)}){m.group(3)}")
        print(f"  Fixed arrow body: {rel}")
        fixed += 1
        write(fpath, c)
        continue
    
    # Pattern 2: The closing might be wrong too — check for );
    # Files that had (x) => { ... } pattern
    # Should end with: });  but might be broken
    # Check if file ends with just );
    if c.rstrip().endswith(");"):
        # This is correct for arrow functions returning JSX directly
        pass
    
    write(fpath, c)

print(f"\nFixed {fixed} files")