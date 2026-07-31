import json
import pathlib
import re
import sys

source = pathlib.Path("lib/data.ts").read_text(encoding="utf-8")

def array(name: str):
    match = re.search(rf"const {name} = \[(.*?)\];", source, re.S)
    if not match:
        raise RuntimeError(name)
    body = re.sub(r",\s*$", "", match.group(1))
    return json.loads("[" + body + "]")

symbols = array("SYMBOLS")
names = array("NAMES")
rows = []
start = int(sys.argv[1]) if len(sys.argv) > 1 else 21
end = int(sys.argv[2]) if len(sys.argv) > 2 else 118
for number, (symbol, name) in enumerate(zip(symbols, names), 1):
    if number < start or number > end:
        continue
    period = 4 if number <= 36 else 5 if number <= 54 else 6 if number <= 86 else 7
    if 57 <= number <= 71:
        category = "lanthanide"
    elif 89 <= number <= 103:
        category = "actinide"
    elif number in (2, 10, 18, 36, 54, 86, 118):
        category = "noble"
    elif number in (9, 17, 35, 53, 85, 117):
        category = "halogen"
    elif number in (3, 11, 19, 37, 55, 87):
        category = "alkali"
    elif number in (4, 12, 20, 38, 56, 88):
        category = "alkaline"
    elif 21 <= number <= 30 or 39 <= number <= 48 or 72 <= number <= 80 or 104 <= number <= 112:
        category = "transition"
    else:
        category = "post-transition"
    state = "жасанды" if number >= 104 else "қатты"
    details = json.dumps({"international": symbol, "mass": "—", "group": None, "period": period, "category": category, "state": state, "config": "Электрондық конфигурация анықтамалықта", "history": "Элементтің ашылу тарихы контент редакторында толықтырылады.", "uses": "Оқу анықтамалығы мен ғылыми зерттеулер.", "safety": "Зертханалық қауіпсіздік ережелерін сақтаңыз."}, ensure_ascii=False).replace("'", "''")
    rows.append(f"('element:{number}', {number}, '{symbol}', '{name.replace(chr(39), chr(39)*2)}', '{details}', unixepoch(), unixepoch())")

print("INSERT OR IGNORE INTO chemical_elements (id, atomic_number, symbol, name_kk, details, created_at, updated_at) VALUES\n" + ",\n".join(rows) + ";")
