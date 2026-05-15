from pathlib import Path
import json


ROOT = Path("c:/laragon/www/jivara/dataScience")
NOTEBOOK_PATH = ROOT / "notebooks" / "Master_Data_Preparation_Pipeline_v2.ipynb"


def source(text):
    return text.splitlines(keepends=True)


def clear_code_cell(cell):
    if cell.get("cell_type") == "code":
        cell["outputs"] = []
        cell["execution_count"] = None


nb = json.loads(NOTEBOOK_PATH.read_text(encoding="utf-8"))
cells = nb["cells"]

# 1) Update notebook introduction so the business question reflects the new scope.
cells[0]["source"] = source("""# Master Data Preparation Pipeline
**Project:** Jivara (CC26-PSU090) - Sistem Deteksi Interaksi Obat-Makanan  
**Role:** Data Science (Rizki Pangestu)

Pipeline ini memproses dataset mentah menjadi artefak siap pakai untuk AI Engineer dan Backend Developer.

## Pertanyaan Bisnis

1. **Bagaimana profil nutrisi 61 kelas makanan target model AI?** Seluruh lookup nutrisi difokuskan pada dataset `nutrition1.csv` dan kelas dari `61_kelas_resep_cleaned.csv`.
2. **Bagaimana profil dan distribusi obat-obatan yang terdaftar di BPOM?** Bagaimana distribusi golongan obat, top perusahaan farmasi, bentuk sediaan, tren registrasi, dan komposisi zat aktifnya?
3. **Apakah 61 kelas makanan target model AI sudah memiliki data nutrisi yang lengkap?** Berapa banyak kelas yang datanya hilang dari `nutrition1.csv` dan perlu diimputasi secara manual?
4. **Seberapa siap dataset untuk digunakan oleh AI Engineer?** Apakah seluruh pemetaan antara output model (class name) dan database nutrisi sudah terverifikasi?
""")

# 2) Remove the old global nutrition section entirely.
start = next(
    i for i, cell in enumerate(cells)
    if "Data Wrangling" in "".join(cell.get("source", []))
    and "Nutrisi Makanan Global" in "".join(cell.get("source", []))
)
end = next(
    i for i in range(start + 1, len(cells))
    if "## 4. Unifikasi Database Nutrisi" in "".join(cells[i].get("source", []))
)
del cells[start:end]

# Re-resolve cells after deletion.
cells = nb["cells"]

unify_idx = next(i for i, cell in enumerate(cells) if "## 4. Unifikasi Database Nutrisi" in "".join(cell.get("source", [])))
cells[unify_idx]["source"] = source("""---
## 3. Fokus Database Nutrisi 61 Kelas

Bagian ini tidak lagi menggabungkan dataset nutrisi global. Database nutrisi dibuat dari `nutrition1.csv`, lalu dipersempit ke 61 kelas makanan target dari `61_kelas_resep_cleaned.csv`.
""")

unify_code_idx = unify_idx + 1
cells[unify_code_idx]["source"] = source("""# Tambahkan kolom yang hilang agar schema seragam
nutrition_indo['food_name_en'] = np.nan
for extra_col in ['fiber', 'sugars', 'sodium']:
    if extra_col not in nutrition_indo.columns:
        nutrition_indo[extra_col] = np.nan

TARGET_COLUMNS = ['food_name', 'food_name_en', 'source', 'calories',
                  'proteins', 'fat', 'carbohydrate', 'weight_grams',
                  'fiber', 'sugars', 'sodium']

nutrition_reference = nutrition_indo[TARGET_COLUMNS].copy()
nutrition_reference['food_name'] = nutrition_reference['food_name'].str.strip()

# Ambil 61 kelas target dari dataset resep yang sudah dibersihkan.
recipe_classes_path = OUTPUT_DIR / 'processed' / '61_kelas_resep_cleaned.csv'
recipe_classes = pd.read_csv(recipe_classes_path)
target_food_classes = sorted(recipe_classes['Kelas_YOLO'].dropna().unique())

if len(target_food_classes) != 61:
    raise ValueError(f"Expected 61 target classes, got {len(target_food_classes)}")

print(f"Referensi nutrisi dari nutrition1.csv: {len(nutrition_reference)} entri")
print(f"Target kelas makanan: {len(target_food_classes)} kelas")
print(target_food_classes[:10])
""")
clear_code_cell(cells[unify_code_idx])

impute_idx = next(i for i, cell in enumerate(cells) if "## 7. Imputasi Data Nutrisi" in "".join(cell.get("source", [])))
cells[impute_idx]["source"] = source("""---
## 6. Imputasi dan Subset Nutrisi 61 Kelas

Beberapa kelas target tidak tersedia langsung di `nutrition1.csv`. Nilai yang tidak ditemukan diimputasi manual dari referensi TKPI/panganku.org atau referensi gizi umum per 100 gram. Setelah imputasi, tabel final hanya berisi 61 baris sesuai 61 kelas model AI.
""")

impute_code_idx = impute_idx + 1
cells[impute_code_idx]["source"] = source("""MANUAL_NUTRITION_61_CLASSES = [
    {"food_name": "Ayam betutu", "calories": 165, "proteins": 15.0, "fat": 10.0, "carbohydrate": 3.0},
    {"food_name": "Ayam bumbu rujak", "calories": 180, "proteins": 14.0, "fat": 11.0, "carbohydrate": 6.0},
    {"food_name": "Ayam goreng lengkuas", "calories": 240, "proteins": 16.0, "fat": 17.0, "carbohydrate": 5.0},
    {"food_name": "Bir pletok", "calories": 45, "proteins": 0.1, "fat": 0.0, "carbohydrate": 11.0},
    {"food_name": "Capcay", "calories": 85, "proteins": 3.5, "fat": 4.0, "carbohydrate": 9.0},
    {"food_name": "Cendol", "calories": 135, "proteins": 1.5, "fat": 4.5, "carbohydrate": 22.0},
    {"food_name": "Donat", "calories": 452, "proteins": 5.0, "fat": 25.0, "carbohydrate": 51.0},
    {"food_name": "Es dawet", "calories": 130, "proteins": 1.2, "fat": 4.0, "carbohydrate": 21.5},
    {"food_name": "Ikan Goreng", "calories": 199, "proteins": 17.0, "fat": 11.0, "carbohydrate": 8.0},
    {"food_name": "Keladi", "calories": 112, "proteins": 1.5, "fat": 0.2, "carbohydrate": 26.5},
    {"food_name": "Kentang Goreng", "calories": 312, "proteins": 3.4, "fat": 15.0, "carbohydrate": 41.0},
    {"food_name": "Kerak telor", "calories": 250, "proteins": 8.0, "fat": 12.0, "carbohydrate": 28.0},
    {"food_name": "Kiwi", "calories": 61, "proteins": 1.1, "fat": 0.5, "carbohydrate": 15.0},
    {"food_name": "Klappertart", "calories": 310, "proteins": 5.0, "fat": 18.0, "carbohydrate": 33.0},
    {"food_name": "Kolak", "calories": 180, "proteins": 2.0, "fat": 6.0, "carbohydrate": 30.0},
    {"food_name": "Kue lumpur", "calories": 215, "proteins": 4.0, "fat": 8.0, "carbohydrate": 32.0},
    {"food_name": "Kunyit asam", "calories": 55, "proteins": 0.2, "fat": 0.1, "carbohydrate": 13.5},
    {"food_name": "Laksa bogor", "calories": 165, "proteins": 5.0, "fat": 7.0, "carbohydrate": 20.0},
    {"food_name": "Lumpia semarang", "calories": 220, "proteins": 6.0, "fat": 10.0, "carbohydrate": 27.0},
    {"food_name": "Mie aceh", "calories": 180, "proteins": 7.0, "fat": 7.0, "carbohydrate": 24.0},
    {"food_name": "Nagasari", "calories": 175, "proteins": 2.5, "fat": 5.0, "carbohydrate": 30.0},
    {"food_name": "Nugget", "calories": 296, "proteins": 15.0, "fat": 18.0, "carbohydrate": 18.0},
    {"food_name": "Pizza", "calories": 266, "proteins": 11.0, "fat": 10.0, "carbohydrate": 33.0},
    {"food_name": "Sate ayam madura", "calories": 210, "proteins": 15.0, "fat": 12.0, "carbohydrate": 10.0},
    {"food_name": "Sate lilit", "calories": 190, "proteins": 14.0, "fat": 11.0, "carbohydrate": 8.0},
    {"food_name": "Sate maranggi", "calories": 230, "proteins": 18.0, "fat": 14.0, "carbohydrate": 7.0},
    {"food_name": "Soerabi", "calories": 195, "proteins": 3.0, "fat": 7.0, "carbohydrate": 30.0},
    {"food_name": "Soto ayam lamongan", "calories": 120, "proteins": 10.0, "fat": 6.0, "carbohydrate": 5.0},
    {"food_name": "Soto banjar", "calories": 140, "proteins": 11.0, "fat": 8.0, "carbohydrate": 6.0},
    {"food_name": "Steak", "calories": 271, "proteins": 25.0, "fat": 19.0, "carbohydrate": 0.0},
    {"food_name": "Stroberi", "calories": 32, "proteins": 0.7, "fat": 0.3, "carbohydrate": 7.7},
    {"food_name": "Telur Rebus", "calories": 155, "proteins": 13.0, "fat": 11.0, "carbohydrate": 1.1},
    {"food_name": "Terong balado", "calories": 110, "proteins": 2.0, "fat": 7.0, "carbohydrate": 11.0}
]

manual_nutrition = pd.DataFrame(MANUAL_NUTRITION_61_CLASSES)
manual_nutrition['food_name_en'] = np.nan
manual_nutrition['source'] = 'manual_curated_tkpi'
manual_nutrition['weight_grams'] = 100.0
for extra_col in ['fiber', 'sugars', 'sodium']:
    manual_nutrition[extra_col] = np.nan

existing_names = nutrition_reference['food_name'].str.lower()
manual_nutrition = manual_nutrition[
    ~manual_nutrition['food_name'].str.lower().isin(existing_names)
].copy()

nutrition_reference_61 = pd.concat(
    [nutrition_reference, manual_nutrition[TARGET_COLUMNS]],
    ignore_index=True
)

CLASS_TO_NUTRITION_61 = {
    "apel": "Apel malang segar",
    "asinan-jakarta": "Asinan bogor sayuran",
    "ayam-betutu": "Ayam betutu",
    "ayam-bumbu-rujak": "Ayam bumbu rujak",
    "ayam-goreng": "Ayam goreng kentucky dada",
    "ayam-goreng-lengkuas": "Ayam goreng lengkuas",
    "bakso": "Bakso",
    "bika-ambon": "Bika ambon",
    "bir-pletok": "Bir pletok",
    "biskuit-choco-chips": "Biskuit",
    "bubur-manado": "Bubur sagu",
    "burger": "Beef burger",
    "capcay": "Capcay",
    "cendol": "Cendol",
    "donat": "Donat",
    "es-dawet": "Es dawet",
    "gado-gado": "Gado-gado",
    "gudeg": "Gudeg",
    "gulai-ikan-mas": "Gulai ikan masakan",
    "ikan-goreng": "Ikan Goreng",
    "keladi": "Keladi",
    "kentang-goreng": "Kentang Goreng",
    "kerak-telor": "Kerak telor",
    "kiwi": "Kiwi",
    "klappertart": "Klappertart",
    "kolak": "Kolak",
    "kue-lumpur": "Kue lumpur",
    "kunyit-asam": "Kunyit asam",
    "laksa-bogor": "Laksa bogor",
    "lumpia-semarang": "Lumpia semarang",
    "mie-aceh": "Mie aceh",
    "mie-goreng": "Mie Goreng",
    "nagasari": "Nagasari",
    "nanas": "Nanas",
    "nasi-goreng": "Nasi Goreng",
    "nasi-putih": "Nasi",
    "nugget": "Nugget",
    "papeda": "Papeda",
    "pempek": "Pempek tenggiri",
    "pisang": "Pisang Ambon",
    "pizza": "Pizza",
    "rawon-surabaya": "Rawon masakan",
    "rendang": "Rendang sapi masakan",
    "rujak-cingur": "Rujak cingur",
    "sate-ayam-madura": "Sate ayam madura",
    "sate-lilit": "Sate lilit",
    "sate-maranggi": "Sate maranggi",
    "sate-umum": "Sate ayam madura",
    "soerabi": "Soerabi",
    "soto-ayam": "Soto ayam lamongan",
    "soto-banjar": "Soto banjar",
    "spaghetti": "Spaghetti",
    "steak": "Steak",
    "stroberi": "Stroberi",
    "tahu-goreng": "Tahu goreng",
    "tahu-telur": "Tahu telur",
    "telur-goreng": "Telur Ayam ceplok",
    "telur-rebus": "Telur Rebus",
    "tempe-goreng": "Tempe Goreng",
    "terong-balado": "Terong balado",
    "tumis-kangkung": "Kangkung tumis"
}

unmapped_classes = sorted(set(target_food_classes) - set(CLASS_TO_NUTRITION_61))
if unmapped_classes:
    raise ValueError(f"Mapping nutrisi belum tersedia untuk kelas: {unmapped_classes}")

nutrition_lookup = (
    nutrition_reference_61
    .assign(_lookup_key=lambda df: df['food_name'].str.strip().str.lower())
    .drop_duplicates('_lookup_key', keep='first')
    .set_index('_lookup_key')
)

mapping_rows = []
nutrition_rows = []
for yolo_class in target_food_classes:
    nutrition_key = CLASS_TO_NUTRITION_61[yolo_class]
    lookup_key = nutrition_key.strip().lower()

    if lookup_key in nutrition_lookup.index:
        row = nutrition_lookup.loc[lookup_key].drop(labels=['_lookup_key'], errors='ignore').to_dict()
        row['yolo_class'] = yolo_class
        row['nutrition_key'] = nutrition_key
        nutrition_rows.append(row)
        mapping_rows.append({
            'yolo_class': yolo_class,
            'nutrition_key': nutrition_key,
            'status': 'VERIFIED',
            'source': row['source'],
            'calories_check': row['calories']
        })
    else:
        mapping_rows.append({
            'yolo_class': yolo_class,
            'nutrition_key': nutrition_key,
            'status': 'MISSING',
            'source': np.nan,
            'calories_check': np.nan
        })

mapping_df = pd.DataFrame(mapping_rows)
missing = mapping_df[mapping_df['status'] == 'MISSING']
if len(missing) > 0:
    raise ValueError("Masih ada mapping nutrisi missing:\\n" + missing.to_string(index=False))

unified_nutrition = pd.DataFrame(nutrition_rows)
unified_nutrition.insert(0, 'food_id', range(1, len(unified_nutrition) + 1))
ordered_columns = ['food_id', 'yolo_class', 'nutrition_key'] + TARGET_COLUMNS
unified_nutrition = unified_nutrition[ordered_columns]

mapping_df = mapping_df.merge(
    unified_nutrition[['food_id', 'yolo_class']],
    on='yolo_class',
    how='left'
)[['food_id', 'yolo_class', 'nutrition_key', 'status', 'source', 'calories_check']]

print(f"Manual nutrition yang ditambahkan: {len(manual_nutrition)} entri")
print(f"Mapping terverifikasi: {(mapping_df['status'] == 'VERIFIED').sum()}/{len(target_food_classes)} kelas")
print(f"Database nutrisi final: {len(unified_nutrition)} baris")
unified_nutrition.head()
""")
clear_code_cell(cells[impute_code_idx])

mapping_idx = next(i for i, cell in enumerate(cells) if "## 9. Pemetaan Kelas AI ke Database Nutrisi" in "".join(cell.get("source", [])))
cells[mapping_idx]["source"] = source("""---
## 8. Verifikasi Pemetaan 61 Kelas AI ke Nutrisi

Look-Up Table (`mapping_df`) berisi satu baris per kelas YOLO target. Semua kelas wajib berstatus `VERIFIED` sebelum diekspor.
""")

mapping_code_idx = mapping_idx + 1
cells[mapping_code_idx]["source"] = source("""print("Ringkasan status mapping:")
print(mapping_df['status'].value_counts())

print("\\nDistribusi sumber data nutrisi final:")
print(unified_nutrition['source'].value_counts())

mapping_df.head(10)
""")
clear_code_cell(cells[mapping_code_idx])

eda_idx = next(i for i, cell in enumerate(cells) if "## 10. Exploratory Data Analysis" in "".join(cell.get("source", [])))
cells[eda_idx]["source"] = source("""---
## 9. Exploratory Data Analysis & Visualisasi

### 9.1 Profil Nutrisi 61 Kelas Makanan Target
""")

eda_code_idx = eda_idx + 1
cells[eda_code_idx]["source"] = source("""fig, axes = plt.subplots(2, 2, figsize=(14, 10))
metrics = ['calories', 'proteins', 'fat', 'carbohydrate']
titles = ['Kalori (kkal)', 'Protein (g)', 'Lemak (g)', 'Karbohidrat (g)']

for idx, (metric, title) in enumerate(zip(metrics, titles)):
    ax = axes[idx // 2][idx % 2]
    data = unified_nutrition[metric].dropna()
    ax.hist(data, bins=15, alpha=0.75, color='#2f80ed', edgecolor='white')
    ax.set_title(title, fontweight='bold')
    ax.set_xlabel(title)
    ax.set_ylabel('Jumlah kelas')

plt.suptitle('Distribusi Nutrisi 61 Kelas Makanan Target', fontweight='bold', fontsize=14)
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / 'docs' / 'eda_nutrition_61_classes.png'), dpi=150, bbox_inches='tight')
plt.show()

print("Rata-rata nutrisi 61 kelas target:")
print(unified_nutrition[metrics].mean().round(1))
""")
clear_code_cell(cells[eda_code_idx])

# Update nearby markdown headings that still contain old numbering.
for cell in cells:
    text = "".join(cell.get("source", []))
    if "### 10.2 Eksplorasi Data Obat BPOM" in text:
        cell["source"] = source("### 9.2 Eksplorasi Data Obat BPOM\n\nAnalisis distribusi golongan obat, bentuk sediaan, dan top perusahaan farmasi.\n")
    if "### 10.3 Distribusi Kategori Makronutrien" in text:
        cell["source"] = source("### 9.3 Distribusi Kategori Makronutrien 61 Kelas\n")

export_idx = next(i for i, cell in enumerate(cells) if "## 11. Export Artefak Final" in "".join(cell.get("source", [])))
cells[export_idx]["source"] = source("""---
## 10. Export Artefak Final
""")

export_code_idx = export_idx + 1
cells[export_code_idx]["source"] = source("""# 1. Simpan unified nutrition 61 kelas
unified_nutrition.to_csv(OUTPUT_DIR / 'processed' / 'unified_nutrition.csv', index=False)
print(f"unified_nutrition.csv: {len(unified_nutrition)} baris")

# 2. Simpan mapping 61 kelas
mapping_df.to_csv(OUTPUT_DIR / 'processed' / 'mapping_image_nutrition.csv', index=False)
print(f"mapping_image_nutrition.csv: {len(mapping_df)} baris")

# 3. Simpan knowledge base
master_kb = {
    "metadata": {
        "version": "1.1-nutrition1-61-classes",
        "nutrition_source": "nutrition1.csv + manual curated imputation",
        "target_food_classes": len(target_food_classes),
        "indonesian_classes_covered": len(local_knowledge_base)
    },
    "local_ingredient_safety_registry": local_knowledge_base
}

with open(OUTPUT_DIR / 'for_backend' / 'drug_food_kb_final.json', 'w') as file_handle:
    json.dump(master_kb, file_handle, indent=2)
print(f"drug_food_kb_final.json: {len(local_knowledge_base)} obat lokal")

# 4. Generate classes.yaml dari 61 kelas target
import yaml
yolo_classes = target_food_classes

classes_yaml = {
    'path': '../datasets',
    'train': 'images/train', 'val': 'images/val', 'test': 'images/test',
    'nc': len(yolo_classes), 'names': yolo_classes
}

with open(OUTPUT_DIR / 'for_ai_engineer' / 'classes.yaml', 'w') as file_handle:
    yaml.dump(classes_yaml, file_handle, default_flow_style=False, sort_keys=False)
print(f"classes.yaml: {len(yolo_classes)} kelas")
""")
clear_code_cell(cells[export_code_idx])

conclusion_idx = next(i for i, cell in enumerate(cells) if "## 12. Kesimpulan" in "".join(cell.get("source", [])))
cells[conclusion_idx]["source"] = source("""---
## 11. Kesimpulan dan Rekomendasi

### Kesimpulan per Pertanyaan Bisnis

**Q1: Profil Nutrisi 61 Kelas Target**  
Profil nutrisi kini difokuskan pada 61 kelas makanan target. Sumber utama lookup adalah `nutrition1.csv`, dengan imputasi manual hanya untuk kelas yang tidak tersedia langsung.

**Q2: Distribusi Severity Interaksi Obat-Makanan**  
Dari dataset interaksi obat-makanan, mayoritas interaksi terklasifikasi sebagai MONITOR dan INTAKE_TIMING. Interaksi level AVOID_CRITICAL tetap menjadi prioritas utama sistem alert.

**Q3: Kelengkapan Data Nutrisi untuk 61 Kelas Target**  
Seluruh 61 kelas target sudah memiliki mapping nutrisi terverifikasi. Output final `unified_nutrition.csv` hanya berisi 61 baris, satu baris per kelas makanan.

**Q4: Kesiapan Dataset untuk AI Engineer**  
File konfigurasi (`classes.yaml`), database nutrisi 61 kelas (`unified_nutrition.csv`), mapping lookup (`mapping_image_nutrition.csv`), dan knowledge base (`drug_food_kb_final.json`) siap digunakan.

### Rekomendasi

1. **Training AI**: Gunakan `classes.yaml` yang berisi 61 kelas target agar konsisten dengan mapping nutrisi.
2. **Backend Lookup**: Gunakan `mapping_image_nutrition.csv` untuk menghubungkan output YOLO ke baris nutrisi final.
3. **Monitoring Data**: Jika kelas baru ditambahkan, update `61_kelas_resep_cleaned.csv`, `CLASS_TO_NUTRITION_61`, dan imputasi manual bila tidak ada di `nutrition1.csv`.
4. **Validasi Nutrisi**: Nilai manual sebaiknya ditinjau berkala dengan referensi TKPI/panganku.org atau sumber gizi resmi lain.
""")

NOTEBOOK_PATH.write_text(json.dumps(nb, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"Updated {NOTEBOOK_PATH}")
