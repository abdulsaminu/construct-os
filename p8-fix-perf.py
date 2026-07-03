#!/usr/bin/env python3
"""Add React.memo to pure presentational components and useMemo on column arrays"""
import re, os, glob

SRC = "/home/z/my-project/construct-os/frontend/src"

def read(p):
    with open(p) as f: return f.read()
def write(p, c):
    with open(p, "w") as f: f.write(c)

# Components that should be wrapped in React.memo (pure, props-only, no hooks/state)
MEMO_COMPONENTS = [
    "components/ui/Panel.tsx",
    "components/ui/EmptyState.tsx",
    "components/ui/PageHeader.tsx",
    "components/ui/RiskBadge.tsx",
    "components/ui/HealthBadge.tsx",
    "components/ui/ConfidenceBadge.tsx",
    "components/ui/RecommendationBadge.tsx",
    "components/ui/CategoryBadge.tsx",
    "components/ui/ScoreBar.tsx",
    "components/ui/CopyButton.tsx",
    "components/ui/SectionHeader.tsx",
    "components/ui/ProgressBar.tsx",
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
    "components/treasury/TreasuryHealth.tsx",
    "components/project/ProjectOverviewCards.tsx",
]

# Files with column arrays that need useMemo
COLUMN_MEMO_FILES = [
    "components/contractors/ContractorTable.tsx",
    "components/ledger/LedgerTable.tsx",
    "components/treasury/CapitalEventsTable.tsx",
    "components/project/ProjectLedger.tsx",
]

stats = {"memo": 0, "useMemo": 0}

# Phase 1: Add React.memo
for rel_path in MEMO_COMPONENTS:
    fpath = os.path.join(SRC, rel_path)
    if not os.path.exists(fpath):
        continue
    c = read(fpath)

    # Skip if already has React.memo
    if "React.memo" in c:
        continue

    # Check if it uses React (has useState/useEffect/etc.) — skip those
    has_hooks = bool(re.search(r'\buseState\b|\buseEffect\b|\buseCallback\b|\buseMemo\b|\buseRef\b|\buseReducer\b', c))

    if has_hooks:
        # For components with hooks, wrap the export: export const X = React.memo(...
        # Replace: export const ComponentName: React.FC<Props> = ({ ... }) => {
        # With: export const ComponentName = React.memo(({ ... }) => {
        m = re.search(r'export const (\w+): React\.FC<(\w+)> = \((\{[^}]*\})\) => \{', c)
        if m:
            name, props_type, props_destruct = m.groups()
            # Add React import if needed
            if "import React" not in c:
                c = "import React from 'react';\n" + c
            elif "import React," not in c and "import React from" in c:
                pass  # Already has default import
            
            old = f'export const {name}: React.FC<{props_type}> = ({props_destruct}) => {{'
            new = f'export const {name} = React.memo(({props_destruct}) => {{'
            c = c.replace(old, new)
            
            # Close the memo: find the last }; of the component and add );
            # Find the export line position and find its matching closing
            # Simple approach: find the last }; before EOF
            # Actually, for FC components the pattern is: export const X = (...) => { ... };
            # After wrapping in memo, we need: export const X = React.memo((...) => { ... });
            # We need to find the closing }; of the arrow function
            
            # Find the export line
            export_idx = c.index(f"export const {name} = React.memo")
            # Find the opening { after the arrow
            brace_start = c.index("{", export_idx)
            # Count braces to find the matching close
            depth = 0
            close_idx = -1
            for i in range(brace_start, len(c)):
                if c[i] == "{": depth += 1
                elif c[i] == "}": depth -= 1
                if depth == 0:
                    close_idx = i
                    break
            
            if close_idx >= 0:
                # Replace }; with }); 
                c = c[:close_idx] + "});" + c[close_idx + 2:]
            
            write(fpath, c)
            stats["memo"] += 1
            print(f"  memo(w/hooks): {rel_path}")
            continue
        else:
            # Try simpler export pattern
            m = re.search(r'export const (\w+): React\.FC<(\w+)> = \(', c)
            if m:
                name = m.group(1)
                if "import React" not in c:
                    c = "import React from 'react';\n" + c
                old = f'export const {name}: React.FC<{m.group(2)}> = ('
                new = f'export const {name} = React.memo('
                c = c.replace(old, new)
                
                # Find the last }; and replace with });
                export_idx = c.index(f"export const {name} = React.memo")
                brace_start = c.index("{", export_idx)
                depth = 0
                for i in range(brace_start, len(c)):
                    if c[i] == "{": depth += 1
                    elif c[i] == "}": depth -= 1
                    if depth == 0:
                        close_idx = i
                        break
                if close_idx >= 0:
                    c = c[:close_idx] + "});" + c[close_idx + 2:]
                
                write(fpath, c)
                stats["memo"] += 1
                print(f"  memo(w/hooks): {rel_path}")
                continue
    
    # Pure component (no hooks): simpler wrap
    m = re.search(r'export const (\w+): React\.FC<(\w+)> = \((\{[^}]*\})\) => \{', c)
    if not m:
        m = re.search(r'export const (\w+): React\.FC<(\w+)> = \(', c)
    
    if m:
        name = m.group(1)
        if "import React" not in c:
            c = "import React from 'react';\n" + c
        
        # Replace export
        c = re.sub(
            f'export const {name}: React\\.FC<\\w+> = \\(',
            f'export const {name} = React.memo(',
            c
        )
        
        # Find closing
        export_idx = c.index(f"export const {name} = React.memo")
        brace_start = c.index("{", export_idx)
        depth = 0
        for i in range(brace_start, len(c)):
            if c[i] == "{": depth += 1
            elif c[i] == "}": depth -= 1
            if depth == 0:
                close_idx = i
                break
        if close_idx >= 0:
            c = c[:close_idx] + "});" + c[close_idx + 2:]
        
        write(fpath, c)
        stats["memo"] += 1
        print(f"  memo(pure): {rel_path}")

# Phase 2: Add useMemo to column arrays
for rel_path in COLUMN_MEMO_FILES:
    fpath = os.path.join(SRC, rel_path)
    if not os.path.exists(fpath):
        continue
    c = read(fpath)
    
    # Check for `const columns = [` pattern (not already useMemo'd)
    if "useMemo" in c or "const columns" not in c:
        continue
    
    # Find: const columns = [
    # Replace with: const columns = useMemo(() => [
    # And find the matching ]; and replace with ], []);
    
    idx = c.index("const columns = [")
    c = c.replace("const columns = [", "const columns = useMemo(() => [", 1)
    
    # Find the matching ];
    bracket_start = c.index("[", idx)
    depth = 0
    for i in range(bracket_start, len(c)):
        if c[i] == "[": depth += 1
        elif c[i] == "]": depth -= 1
        if depth == 0:
            close_idx = i
            break
    
    if close_idx >= 0:
        c = c[:close_idx + 1] + ", []);" + c[close_idx + 2:]
    
    # Add useMemo import if needed
    if "useMemo" in c and "import" in c:
        # Check if useMemo is already imported
        if not re.search(r'import.*\buseMemo\b', c):
            # Add to existing React import
            c = re.sub(
                r"import React, \{([^}]*)\} from 'react'",
                lambda m: f"import React, {{ {m.group(1)}, useMemo }} from 'react'" if m.group(1).strip() else "import React, { useMemo } from 'react'",
                c
            )
            # Also handle import { ... } without React
            c = re.sub(
                r"import \{([^}]*)\} from 'react'",
                lambda m: f"import {{ {m.group(1)}, useMemo }} from 'react'",
                c
            )
    
    write(fpath, c)
    stats["useMemo"] += 1
    print(f"  useMemo(columns): {rel_path}")

print(f"\nReact.memo added: {stats['memo']}")
print(f"useMemo on columns: {stats['useMemo']}")