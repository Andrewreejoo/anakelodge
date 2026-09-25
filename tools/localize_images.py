#!/usr/bin/env python3
"""
Copy every photo that is still hosted on the old website (www.anakelodge.com)
into this repository and point the site at the local copies.

Run it ONCE, before you switch the anakelodge.com domain over to GitHub Pages
(otherwise the photos disappear when the old site is switched off):

    python3 tools/localize_images.py

Then commit and push the new "images/site" folder and the updated _data files.
"""
import os, re, sys, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "_data")
OUT = os.path.join(ROOT, "images", "site")
PATTERN = re.compile(r"https://www\.anakelodge\.com/images/[^\s\"'#]+")

def local_name(url):
    path = urllib.parse.unquote(urllib.parse.urlparse(url).path)          # /images/other/moments/2 house day time.jpg
    rel = path.split("/images/", 1)[1]
    rel = re.sub(r"[^A-Za-z0-9._/-]+", "-", rel)                           # spaces -> dashes
    return rel

changed = 0
for fn in sorted(os.listdir(DATA)):
    if not fn.endswith((".yml", ".yaml")):
        continue
    p = os.path.join(DATA, fn)
    text = open(p, encoding="utf-8").read()
    for url in sorted(set(PATTERN.findall(text))):
        rel = local_name(url)
        dest = os.path.join(OUT, rel)
        if not os.path.exists(dest):
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            print("downloading", url)
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=60) as r, open(dest, "wb") as f:
                    f.write(r.read())
            except Exception as e:
                print("  !! failed:", e, "- leaving the web address unchanged")
                continue
        text = text.replace(url, "images/site/" + rel)
        changed += 1
    open(p, "w", encoding="utf-8").write(text)

print(f"\nDone. {changed} photo references now point to files inside this site.")
