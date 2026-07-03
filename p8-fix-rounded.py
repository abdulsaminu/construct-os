#!/usr/bin/env python3
"""Fix remaining issues: broken error divs, rounded-12 semantic tokens"""
import re, os, glob

SRC = "/home/z/my-project/construct-os/frontend/src"

def read(p):
    with open(p) as f: return f.read()
def write(p, c):
    with open(p, "w") as f: f.write(c)

files = glob.glob(os.path.join(SRC, "**/*.tsx"), recursive=True)
stats = 0

for fpath in files:
    orig = read(fpath)
    c = orig
    rel = fpath.replace(SRC + "/", "")

    # 1. Fix broken error divs: "> role="alert"{" → "> role="alert">{"
    if '"> role="alert"{' in c:
        c = c.replace('"> role="alert"{', '" role="alert">{')
        print(f"FIXED broken error div in {rel}")
        stats += 1

    # 2. rounded-12 on <input>, <textarea>, <select> → rounded-input
    def fix_input_rounded(m):
        tag = m.group(0)
        if 'rounded-12' in tag:
            tag = tag.replace('rounded-12', 'rounded-input')
            return tag
        return m.group(0)
    # Match <input, <textarea, <select with rounded-12 (may span multiple lines)
    for tag_name in ['input', 'textarea', 'select']:
        new_c = re.sub(
            r'<' + tag_name + r'[^>]*rounded-12[^>]*>',
            fix_input_rounded,
            c,
            flags=re.DOTALL
        )
        if new_c != c:
            c = new_c
            print(f"  {rel}: {tag_name} rounded-12→rounded-input")
            stats += 1

    # 3. rounded-12 on <button → rounded-btn
    def fix_btn_rounded(m):
        tag = m.group(0)
        if 'rounded-12' in tag:
            tag = tag.replace('rounded-12', 'rounded-btn')
            return tag
        return m.group(0)
    new_c = re.sub(r'<button[^>]*rounded-12[^>]*>', fix_btn_rounded, c, flags=re.DOTALL)
    if new_c != c:
        c = new_c
        print(f"  {rel}: button rounded-12→rounded-btn")
        stats += 1

    # 4. Remaining rounded-12 on other elements (divs, etc.) → rounded-card
    if 'rounded-12' in c:
        c = c.replace('rounded-12', 'rounded-card')
        print(f"  {rel}: remaining rounded-12→rounded-card")
        stats += 1

    if c != orig:
        write(fpath, c)

print(f"\nTotal fixes: {stats}")