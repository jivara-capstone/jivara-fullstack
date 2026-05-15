"""
Sinkronkan fungsi extract_nama_bahan di notebook dari scratch/regenerate_kb.py.

Script ini menjaga satu sumber logika pembersihan agar notebook dan regenerasi
standalone tidak divergen.
"""
from pathlib import Path
import json


ROOT = Path("c:/laragon/www/jivara/dataScience")
NOTEBOOK_PATH = ROOT / "notebooks" / "Cookpad_Resep_Data_Processing.ipynb"
REGENERATE_SCRIPT = ROOT / "scratch" / "regenerate_kb.py"


script_source = REGENERATE_SCRIPT.read_text(encoding="utf-8")
func_start = script_source.index("def extract_nama_bahan(text):")
func_end = script_source.index("\n\n# === Build Knowledge Base ===")
function_source = script_source[func_start:func_end].strip()

new_source = f'''{function_source}

# Buat Knowledge Base Dictionary
ingredient_kb = {{}}

# Proses per kelas makanan
for kelas in resep['Kelas_YOLO'].unique():
    # Ambil semua resep untuk kelas ini
    df_kelas = resep[resep['Kelas_YOLO'] == kelas]

    # Flatten semua bahan
    all_bahan_kelas = df_kelas['List_Bahan'].explode()
    all_bahan_kelas = all_bahan_kelas[all_bahan_kelas.str.len() > 0]

    # Bersihkan nama bahan
    bahan_names = all_bahan_kelas.apply(extract_nama_bahan).dropna()

    # Hitung frekuensi tiap bahan
    bahan_counts = bahan_names.value_counts()

    # Ambil bahan utama (muncul di minimal 20% resep, maksimal 15 bahan)
    threshold = max(2, len(df_kelas) * 0.20)
    top_bahan = bahan_counts[bahan_counts >= threshold].head(15).index.tolist()

    # Jika tidak ada yang lewat threshold, ambil top 5 saja
    if not top_bahan:
        top_bahan = bahan_counts.head(5).index.tolist()

    ingredient_kb[kelas] = top_bahan

print(f"Berhasil membuat mapping bahan untuk {{len(ingredient_kb)}} kelas makanan.")
print("\\nContoh Mapping:")
for k in ['nasi-goreng', 'rendang', 'ayam-goreng-lengkuas']:
    if k in ingredient_kb:
        print(f"  - {{k}}: {{ingredient_kb[k]}}")
'''

notebook = json.loads(NOTEBOOK_PATH.read_text(encoding="utf-8"))
modified = False

for cell in notebook["cells"]:
    if cell.get("cell_type") != "code":
        continue

    source = "".join(cell.get("source", []))
    if "def extract_nama_bahan(text):" in source:
        cell["source"] = new_source.splitlines(keepends=True)
        modified = True
        break

if not modified:
    raise RuntimeError("Tidak menemukan cell berisi extract_nama_bahan di notebook.")

for cell in notebook["cells"]:
    if cell.get("cell_type") != "code":
        continue

    source = "".join(cell.get("source", []))
    if '"version":' in source and "food_to_ingredient_kb.json" in source:
        import re

        source = re.sub(r'"version":\s*"[^"]+"', '"version": "2.3-cleaned"', source)
        cell["source"] = source.splitlines(keepends=True)

NOTEBOOK_PATH.write_text(json.dumps(notebook, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"Synced cleaner into {NOTEBOOK_PATH}")
