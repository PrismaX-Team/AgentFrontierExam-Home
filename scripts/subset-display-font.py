"""Refresh the fallback for Chinese display type when adding titles or names.

Use fontTools with WOFF2 support (fonttools[woff]) and the upstream static
Noto Serif SC Regular from the Serif2.003 release, licensed under the SIL OFL.
https://github.com/notofonts/noto-cjk/blob/Serif2.003/Serif/SubsetOTF/SC/NotoSerifSC-Regular.otf

    python3 scripts/subset-display-font.py /path/to/NotoSerifSC-Regular.otf
"""

import argparse
import json
import re
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
DESTINATION = SRC / "assets" / "afe-song-display.woff2"


def display_characters():
    tasks = json.loads((SRC / "data" / "tasks.json").read_text(encoding="utf-8"))
    text = [task["zh"]["title"] for task in tasks]
    copy_files = [
        *sorted((SRC / "views").glob("*.mjs")),
        *sorted((SRC / "data").glob("*.mjs")),
        SRC / "data" / "experts.json",
        SRC / "assets" / "catalog.js",
    ]
    text.extend(path.read_text(encoding="utf-8") for path in copy_files)
    return set(re.findall(r"[\u3000-\u303F\u3400-\u9FFF\uFF00-\uFFEF]", "".join(text)))


def make_font(source):
    font = TTFont(source, recalcTimestamp=False)
    options = subset.Options()
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 7, 9, 13, 14]
    subsetter = subset.Subsetter(options)
    characters = display_characters()
    subsetter.populate(unicodes=map(ord, characters))
    subsetter.subset(font)

    family = "AFE Song Display"
    postscript = "AFESongDisplay-Regular"
    names = {1: family, 3: postscript, 4: family, 6: postscript}
    for record in font["name"].names:
        if record.nameID in names:
            record.string = names[record.nameID].encode(record.getEncoding())
    cff = font["CFF "].cff
    cff.fontNames = [postscript]
    cff.topDictIndex[0].FamilyName = family
    cff.topDictIndex[0].FullName = family

    font.flavor = "woff2"
    font.save(DESTINATION)
    print(f"{len(characters)} characters in the display fallback ({DESTINATION.stat().st_size:,} bytes).")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    make_font(parser.parse_args().source)
