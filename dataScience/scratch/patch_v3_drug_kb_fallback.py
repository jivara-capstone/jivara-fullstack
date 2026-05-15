from pathlib import Path
import json


ROOT = Path("c:/laragon/www/jivara/dataScience")
NOTEBOOK_PATH = ROOT / "notebooks" / "Master_Data_Preparation_Pipeline_v3.ipynb"


def source(text):
    return text.splitlines(keepends=True)


nb = json.loads(NOTEBOOK_PATH.read_text(encoding="utf-8"))

for cell in nb["cells"]:
    cell_source = "".join(cell.get("source", []))
    if "with open(RAW_DIR / 'indonesian_food_drug_interactions.json'" in cell_source:
        cell["source"] = source("""drug_interactions_path = RAW_DIR / 'indonesian_food_drug_interactions.json'
drug_kb_fallback_path = OUTPUT_DIR / 'for_backend' / 'drug_food_kb_final.json'

local_knowledge_base = None

if drug_interactions_path.exists():
    with open(drug_interactions_path, 'r', encoding='utf-8') as file_handle:
        indo_drug_interactions = json.load(file_handle)

    print(f"Total entri makanan Indonesia: {len(indo_drug_interactions)}")
    print(f"Kolom per entri: {list(indo_drug_interactions[0].keys())}")
    print(f"\\nContoh entri:")
    print(json.dumps(indo_drug_interactions[0], indent=2, ensure_ascii=False))
elif drug_kb_fallback_path.exists():
    with open(drug_kb_fallback_path, 'r', encoding='utf-8') as file_handle:
        fallback_kb = json.load(file_handle)

    local_knowledge_base = fallback_kb.get('local_ingredient_safety_registry', {})
    indo_drug_interactions = list(local_knowledge_base.values())

    print(f"File mentah tidak ditemukan: {drug_interactions_path}")
    print(f"Menggunakan fallback KB: {drug_kb_fallback_path}")
    print(f"Knowledge base lokal: {len(local_knowledge_base)} makanan")
else:
    indo_drug_interactions = []
    local_knowledge_base = {}
    print(f"File mentah dan fallback KB tidak ditemukan. Section drug-food KB dilewati.")
""")
    elif "local_knowledge_base = {}" in cell_source and "food_key = entry['food_name']" in cell_source:
        cell["source"] = source("""if local_knowledge_base is None:
    local_knowledge_base = {}
    for entry in indo_drug_interactions:
        food_key = entry['food_name'].lower().replace(' ', '-')
        local_knowledge_base[food_key] = entry

print(f"Knowledge base lokal: {len(local_knowledge_base)} makanan")
if local_knowledge_base:
    print(f"Contoh key: {list(local_knowledge_base.keys())[:5]}")
""")

NOTEBOOK_PATH.write_text(json.dumps(nb, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"Patched fallback in {NOTEBOOK_PATH}")
