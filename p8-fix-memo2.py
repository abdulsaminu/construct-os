#!/usr/bin/env python3
"""Fix remaining broken React.memo wrapping - block body pattern"""
import re, os

SRC = "/home/z/my-project/construct-os/frontend/src"

BROKEN = [
    "components/ui/RiskBadge.tsx",
    "components/ui/HealthBadge.tsx",
    "components/ui/ConfidenceBadge.tsx",
    "components/ui/RecommendationBadge.tsx",
    "components/ui/CategoryBadge.tsx",
    "components/ui/CopyButton.tsx",
    "components/dashboard/DashboardKPIs.tsx",
    "components/dashboard/PortfolioPanel.tsx",
    "components/dashboard/CommandCenter.tsx",
    "components/dashboard/RiskMonitor.tsx",
    "components/dashboard/RecentLedger.tsx",
    "components/dashboard/UpcomingActions.tsx",
    "components/dashboard/TreasuryFlow.tsx",
    "components/treasury/TreasuryKPIs.tsx",
    "components/treasury/ActivityFeed.tsx",
    "components/treasury/QuickActions.tsx",
    "components/treasury/TreasuryTimeline.tsx",
    "components/project/ProjectOverviewCards.tsx",
]

def read(p):
    with open(p) as f: return f.read()
def write(p, c):
    with open(p, "w") as f: f.write(c)

fixed = 0
for rel in BROKEN:
    fpath = os.path.join(SRC, rel)
    if not os.path.exists(fpath):
        continue
    c = read(fpath)
    
    # Pattern: React.memo({...}); => {
    # Fix to: React.memo(({...}) => {
    m = re.search(r'(React\.memo\()(\{[^}]*\})(\); => \{)', c)
    if m:
        c = c.replace(m.group(0), f"{m.group(1)}({m.group(2)}) => {{")
        print(f"  Fixed block body opening: {rel}")
    
    # Also fix the closing: }; at end of file should be });
    # For components with { } body, the last }; needs to become });
    # But we need to be careful - only the component-level };
    
    # Simple approach: if the file content has the function ending with };
    # and the export starts with React.memo, change the last standalone }; to });
    
    # Count the braces - find the component function body
    export_match = re.search(r'export const \w+ = React\.memo\(', c)
    if export_match:
        # Find the opening { after the arrow
        body_start = c.index('{', export_match.end())
        depth = 0
        close_idx = -1
        for i in range(body_start, len(c)):
            if c[i] == '{': depth += 1
            elif c[i] == '}': depth -= 1
            if depth == 0:
                close_idx = i
                break
        
        if close_idx >= 0:
            # Check what comes after the closing }
            after = c[close_idx + 1:close_idx + 3].strip()
            if after == ';':
                # Replace }; with });
                c = c[:close_idx + 1] + ');' + c[close_idx + 2:]
                print(f"  Fixed closing: {rel}")
    
    write(fpath, c)
    fixed += 1

print(f"\nProcessed {fixed} files")