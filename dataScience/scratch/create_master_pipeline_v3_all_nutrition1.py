from pathlib import Path
import json


ROOT = Path("c:/laragon/www/jivara/dataScience")
V2_PATH = ROOT / "notebooks" / "Master_Data_Preparation_Pipeline_v2.ipynb"
V3_PATH = ROOT / "notebooks" / "Master_Data_Preparation_Pipeline_v3.ipynb"


def source(text):
    return text.splitlines(keepends=True)


def clear_code_cell(cell):
    if cell.get("cell_type") == "code":
        cell["outputs"] = []
        cell["execution_count"] = None


nb = json.loads(V2_PATH.read_text(encoding="utf-8"))
cells = nb["cells"]

cells[0]["source"] = source("""# Master Data Preparation Pipeline v3
**Project:** Jivara (CC26-PSU090) - Sistem Deteksi Interaksi Obat-Makanan  
**Role:** Data Science (Rizki Pangestu)

Pipeline v3 ini memproses seluruh entri nutrisi dari `nutrition1.csv`, bukan hanya 61 kelas makanan target. Dataset nutrisi global `nutrition.csv` tetap tidak dipakai.

## Pertanyaan Bisnis

1. **Bagaimana profil nutrisi seluruh makanan di `nutrition1.csv`?** Semua baris valid diproses sebagai katalog nutrisi Indonesia.
2. **Bagaimana profil dan distribusi obat-obatan yang terdaftar di BPOM?** Bagaimana distribusi golongan obat, top perusahaan farmasi, bentuk sediaan, tren registrasi, dan komposisi zat aktifnya?
3. **Seberapa siap katalog nutrisi Indonesia untuk digunakan backend/AI?** Apakah setiap entri memiliki `food_id`, `nutrition_key`, dan fitur makronutrien turunan?
4. **Bagaimana artefak akhir dipisahkan dari pipeline 61 kelas?** Output v3 disimpan dengan nama file khusus agar tidak menimpa artefak v2.
""")

focus_idx = next(i for i, cell in enumerate(cells) if "Fokus Database Nutrisi 61 Kelas" in "".join(cell.get("source", [])))
cells[focus_idx]["source"] = source("""---
## 3. Database Nutrisi Seluruh `nutrition1.csv`

Bagian ini tidak lagi membatasi data nutrisi ke 61 kelas. Semua entri unik dari `nutrition1.csv` diproses sebagai katalog nutrisi Indonesia.
""")

cells[focus_idx + 1]["source"] = source("""# Tambahkan kolom yang hilang agar schema seragam
nutrition_indo['food_name_en'] = np.nan
for extra_col in ['fiber', 'sugars', 'sodium']:
    if extra_col not in nutrition_indo.columns:
        nutrition_indo[extra_col] = np.nan

TARGET_COLUMNS = ['food_name', 'food_name_en', 'source', 'calories',
                  'proteins', 'fat', 'carbohydrate', 'weight_grams',
                  'fiber', 'sugars', 'sodium']

unified_nutrition = nutrition_indo[TARGET_COLUMNS].copy()
unified_nutrition['food_name'] = unified_nutrition['food_name'].str.strip()
unified_nutrition['nutrition_key'] = unified_nutrition['food_name']
unified_nutrition.insert(0, 'food_id', range(1, len(unified_nutrition) + 1))

ordered_columns = ['food_id', 'nutrition_key'] + TARGET_COLUMNS
unified_nutrition = unified_nutrition[ordered_columns]

nutrition_catalog_df = unified_nutrition[['food_id', 'nutrition_key', 'food_name', 'source']].copy()
nutrition_catalog_df['status'] = 'AVAILABLE'

print(f"Database nutrisi dari seluruh nutrition1.csv: {len(unified_nutrition)} entri")
print(f"Unique nutrition_key: {unified_nutrition['nutrition_key'].nunique()} entri")
unified_nutrition.head()
""")
clear_code_cell(cells[focus_idx + 1])

impute_idx = next(i for i, cell in enumerate(cells) if "Imputasi" in "".join(cell.get("source", [])) and cell.get("cell_type") == "markdown")
cells[impute_idx]["source"] = source("""---
## 6. Validasi Katalog Nutrisi

Karena v3 memproses seluruh `nutrition1.csv`, bagian ini tidak melakukan imputasi manual untuk kelas tertentu. Validasi difokuskan pada kelengkapan kolom numerik utama dan identitas lookup nutrisi.
""")

cells[impute_idx + 1]["source"] = source("""required_numeric_cols = ['calories', 'proteins', 'fat', 'carbohydrate', 'weight_grams']

validation_summary = pd.DataFrame({
    'column': required_numeric_cols,
    'missing_values': [unified_nutrition[col].isna().sum() for col in required_numeric_cols],
    'zero_values': [(unified_nutrition[col] == 0).sum() for col in required_numeric_cols]
})

duplicate_keys = unified_nutrition['nutrition_key'].duplicated().sum()

print("Validasi katalog nutrisi:")
print(validation_summary.to_string(index=False))
print(f"Duplicate nutrition_key: {duplicate_keys}")
print(f"Total entri katalog: {len(unified_nutrition)}")
""")
clear_code_cell(cells[impute_idx + 1])

mapping_idx = next(i for i, cell in enumerate(cells) if "Verifikasi Pemetaan 61 Kelas" in "".join(cell.get("source", [])))
cells[mapping_idx]["source"] = source("""---
## 8. Katalog Lookup Nutrisi

`nutrition_catalog_df` menjadi lookup sederhana dari `food_id` ke `nutrition_key` untuk seluruh entri `nutrition1.csv`.
""")

cells[mapping_idx + 1]["source"] = source("""print("Ringkasan katalog nutrisi:")
print(nutrition_catalog_df['status'].value_counts())

print("\\nDistribusi sumber data nutrisi:")
print(unified_nutrition['source'].value_counts())

nutrition_catalog_df.head(10)
""")
clear_code_cell(cells[mapping_idx + 1])

eda_idx = next(i for i, cell in enumerate(cells) if "Exploratory Data Analysis" in "".join(cell.get("source", [])) and "Visualisasi" in "".join(cell.get("source", [])))
cells[eda_idx]["source"] = source("""---
## 9. Exploratory Data Analysis & Visualisasi

### 9.1 Profil Nutrisi Seluruh `nutrition1.csv`
""")

cells[eda_idx + 1]["source"] = source("""fig, axes = plt.subplots(2, 2, figsize=(14, 10))
metrics = ['calories', 'proteins', 'fat', 'carbohydrate']
titles = ['Kalori (kkal)', 'Protein (g)', 'Lemak (g)', 'Karbohidrat (g)']

for idx, (metric, title) in enumerate(zip(metrics, titles)):
    ax = axes[idx // 2][idx % 2]
    data = unified_nutrition[metric].dropna()
    ax.hist(data, bins=30, alpha=0.75, color='#2f80ed', edgecolor='white')
    ax.set_title(title, fontweight='bold')
    ax.set_xlabel(title)
    ax.set_ylabel('Jumlah makanan')

plt.suptitle('Distribusi Nutrisi Seluruh nutrition1.csv', fontweight='bold', fontsize=14)
plt.tight_layout()
plt.savefig(str(OUTPUT_DIR / 'docs' / 'eda_nutrition1_all.png'), dpi=150, bbox_inches='tight')
plt.show()

print("Rata-rata nutrisi seluruh nutrition1.csv:")
print(unified_nutrition[metrics].mean().round(1))
""")
clear_code_cell(cells[eda_idx + 1])

for cell in cells:
    text = "".join(cell.get("source", []))
    if "### 9.3 Distribusi Kategori Makronutrien 61 Kelas" in text:
        cell["source"] = source("### 9.3 Distribusi Kategori Makronutrien Seluruh `nutrition1.csv`\n")

export_idx = next(i for i, cell in enumerate(cells) if "Export Artefak Final" in "".join(cell.get("source", [])))
cells[export_idx]["source"] = source("""---
## 10. Export Artefak Final v3
""")

cells[export_idx + 1]["source"] = source("""# 1. Simpan unified nutrition semua entri nutrition1.csv
unified_nutrition.to_csv(OUTPUT_DIR / 'processed' / 'unified_nutrition_all_nutrition1.csv', index=False)
print(f"unified_nutrition_all_nutrition1.csv: {len(unified_nutrition)} baris")

# 2. Simpan katalog lookup nutrition1
nutrition_catalog_df.to_csv(OUTPUT_DIR / 'processed' / 'nutrition1_food_catalog.csv', index=False)
print(f"nutrition1_food_catalog.csv: {len(nutrition_catalog_df)} baris")

# 3. Simpan knowledge base
master_kb = {
    "metadata": {
        "version": "1.2-v3-all-nutrition1",
        "nutrition_source": "nutrition1.csv",
        "nutrition_entries": len(unified_nutrition),
        "indonesian_classes_covered": len(local_knowledge_base)
    },
    "local_ingredient_safety_registry": local_knowledge_base
}

with open(OUTPUT_DIR / 'for_backend' / 'drug_food_kb_final_v3.json', 'w') as file_handle:
    json.dump(master_kb, file_handle, indent=2)
print(f"drug_food_kb_final_v3.json: {len(local_knowledge_base)} obat lokal")
""")
clear_code_cell(cells[export_idx + 1])

conclusion_idx = next(i for i, cell in enumerate(cells) if "Kesimpulan dan Rekomendasi" in "".join(cell.get("source", [])))
cells[conclusion_idx]["source"] = source("""---
## 11. Kesimpulan dan Rekomendasi

### Kesimpulan per Pertanyaan Bisnis

**Q1: Profil Nutrisi Seluruh nutrition1.csv**  
Pipeline v3 memproses seluruh entri unik dari `nutrition1.csv` sebagai katalog nutrisi Indonesia, bukan hanya subset 61 kelas.

**Q2: Distribusi Severity Interaksi Obat-Makanan**  
Dataset interaksi obat-makanan tetap dapat dipakai bersama katalog nutrisi, tetapi relasi ke makanan spesifik perlu dilakukan lewat `nutrition_key` atau mapping tambahan jika dibutuhkan backend.

**Q3: Kesiapan Katalog Nutrisi**  
Setiap entri nutrisi memiliki `food_id`, `nutrition_key`, nilai makronutrien utama, dan fitur turunan seperti persentase makro serta `macro_category`.

**Q4: Pemisahan Artefak v3**  
Output v3 disimpan sebagai `unified_nutrition_all_nutrition1.csv` dan `nutrition1_food_catalog.csv` agar tidak menimpa artefak v2 yang fokus pada 61 kelas.

### Rekomendasi

1. **Backend Lookup**: Gunakan `nutrition1_food_catalog.csv` untuk pencarian semua makanan dari `nutrition1.csv`.
2. **AI Integration**: Jika model tetap memakai 61 kelas, gunakan artefak v2. Jika fitur butuh katalog nutrisi lengkap, gunakan artefak v3.
3. **Data Governance**: Pertahankan pemisahan output v2 dan v3 agar lookup 61-class dan lookup katalog penuh tidak tercampur.
""")

for cell in cells:
    clear_code_cell(cell)

V3_PATH.write_text(json.dumps(nb, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"Created {V3_PATH}")
