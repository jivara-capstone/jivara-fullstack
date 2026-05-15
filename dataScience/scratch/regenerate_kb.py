"""
Script standalone untuk regenerasi food_to_ingredient_kb.json
dengan fungsi extract_nama_bahan yang sudah diperbaiki.
"""
import pandas as pd
import re
import json
import ast
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# === Load Data ===
csv_path = 'c:/laragon/www/jivara/dataScience/data_output/processed/61_kelas_resep_cleaned.csv'
output_path = 'c:/laragon/www/jivara/dataScience/data_output/for_ai_engineer/food_to_ingredient_kb.json'

resep = pd.read_csv(csv_path)
print(f"Loaded {len(resep)} rows, {resep['Kelas_YOLO'].nunique()} classes")

# Parse List_Bahan from string to list (delimiter = "|")
resep['List_Bahan'] = resep['Bahan-bahan'].apply(lambda x: [b.strip() for b in str(x).split('|') if b.strip()])

# === Fungsi Pembersih (UPDATED) ===
def extract_nama_bahan(text):
    """Ambil nama bahan, hilangkan kuantitas dan noise lainnya."""
    
    # 0. Hapus karakter unicode aneh (braille space, zero-width, dll)
    text = re.sub(r'[\u2800-\u28FF\u200b-\u200f\u2060\ufeff]', '', text)
    
    # 1. Lowercase dulu agar seragam
    text = text.lower().strip()
    
    # 2. Hapus teks dalam kurung (...) misal: bawang putih (diuleg)
    text = re.sub(r'\(.*?\)', '', text)
    
    # 3. Hapus deskripsi cara potong/olah setelah koma misal: wortel , potong korek api
    text = text.split(',')[0].strip()
    
    # Bersihkan simbol-simbol aneh di awal dan akhir teks seperti ":" atau "-"
    text = re.sub(r'^[\s:\-.,]+', '', text)
    text = re.sub(r'[\s:\-.,]+$', '', text)
    
    # 4. Hapus stop words / label deskriptif
    stopwords_exact = [
        'bahan a', 'bahan b', 'bahan c', 'bahan d', 'bahan acar', 'bahan basah', 
        'bahan bumbu', 'bahan isian', 'bahan kuah kinca', 'bahan kulit', 'bahan salad', 
        'bahan saus', 'bahan serundeng', 'bumbu halus', 'bumbu kacang', 'bumbu marinasi', 
        'bumbu', 'kuah santan', 'pelengkap', 'topping', 'untuk papeda', 'es batu',
        'air', 'air putih', 'air matang', 'air hangat', 'minyak goreng', 'minyak', 
        'garam', 'gula', 'penyedap', 'kaldu bubuk', 'micin', 'air kelapa', 
        'air asam jawa', 'krupuk', 'kerupuk', 'bahan', 'kerupuk mie',
        'tusuk sate', 'lontong', 'nasi', 'serundeng', 'sambal terasi'
    ]
    
    if text in stopwords_exact:
        return None
        
    for stop in stopwords_exact:
        if text.startswith(stop + ":") or text == stop:
            return None

    def is_section_label(value):
        return re.match(r'^(?:bahan|bumbu)\b', value) is not None

    # Header generik di Cookpad sering berbentuk "bahan ..." atau "bumbu ...".
    # Baris seperti ini adalah label section, bukan bahan makanan.
    if is_section_label(text):
        return None

    # 5. Hilangkan kuantitas angka di awal
    text = re.sub(r'^[\d\s,./]+', '', text).strip()
    
    # 6. Hilangkan satuan pengukuran yang lebih lengkap
    satuan = [
        'sdm', 'sdt', 'gram', 'gr', 'kg', 'ml', 'liter', 'lt', 'buah', 'bh', 'butir', 
        'siung', 'lembar', 'lbr', 'batang', 'ruas', 'porsi', 'piring', 'mangkok', 
        'bungkus', 'sachet', 'secukupnya', 'sejumput', 'sesuai selera', 'ikat', 
        'genggam', 'segenggam', 'jempol', 'sendok teh', 'sendok makan', 'cm', 'tsp',
        'papan', 'bonggol', 'keping', 'sedikit', 'ekor', 'btg', 'btr', 'pcs', 'g'
    ]
    satuan_pattern = '|'.join(re.escape(unit) for unit in sorted(satuan, key=len, reverse=True))
    pattern_satuan = r'^(?:' + satuan_pattern + r')(?:\s+|$)'
    text = re.sub(pattern_satuan, '', text, flags=re.IGNORECASE).strip()
    
    # Ulangi lagi hapus angka jika ada
    text = re.sub(r'^[\d\s,./]+', '', text).strip()

    if is_section_label(text):
        return None
    
    # 7. Hilangkan instruksi di akhir teks
    instruksi = [
        'untuk menumis', 'untuk menggoreng', 'untuk membungkus', 'potong sesuai selera'
    ]
    for inst in instruksi:
        text = text.replace(inst, '').strip()

    text = re.sub(r'^(?:potong|iris|cincang)\s+', '', text).strip()
    text = re.sub(
        r'\b(?:digeprek|geprek|dilelehkan|lelehkan|dicincang|cincang|diiris|iris|diparut|parut|haluskan)\b.*$',
        '',
        text,
    ).strip()
        
    # 8. Normalisasi singkatan bahan
    text = text.replace('b.merah', 'bawang merah')
    text = text.replace('b.putih', 'bawang putih')
    text = text.replace('kental manis cap enaak', 'susu kental manis')
    
    # 9. Normalisasi duplikat (sinonim)
    synonyms = {
        'sereh': 'serai',
        'cabe': 'cabai',
        'cabe merah': 'cabai merah',
        'cabe merah besar': 'cabai merah besar',
        'cabe merah keriting': 'cabai merah keriting',
        'cabe rawit': 'cabai rawit',
        'cabe rawit merah': 'cabai rawit merah',
        'cabe keriting': 'cabai keriting',
        'cabe kriting': 'cabai keriting',
        'merica': 'lada',
        'merica bubuk': 'lada bubuk',
        'margarine': 'margarin',
        'bawang putih cincang': 'bawang putih',
        'bawang putih goreng': 'bawang putih',
        'bawang putih iris': 'bawang putih',
        'gula pasir rose brand': 'gula pasir',
        'santan rose brand': 'santan',
        'santan instan': 'santan',
        'santan kental': 'santan',
        'tepung terigu kunci biru': 'tepung terigu',
        'tepung terigu protein rendah': 'tepung terigu',
        'tepung terigu protein sedang': 'tepung terigu',
        'tepung terigu protein tinggi': 'tepung terigu',
        'tepung tapioka rose brand': 'tepung tapioka',
        'tepung kanji / tapioka': 'tepung tapioka',
        'tepung beras rose brand': 'tepung beras',
        'garam halus': 'garam',
        'garam & penyedap rasa': 'penyedap rasa',
        'lada putih': 'lada',
        'ladaku': 'lada',
        'olive oil': 'minyak zaitun',
        'brown sugar': 'gula aren',
        'honey': 'madu',
        'chocochips': 'choco chips',
        'strawberry': 'stroberi',
        'strawberry beku': 'stroberi',
        'totole kaldu jamur': 'kaldu jamur',
        'tsp kaldu jamur': 'kaldu jamur',
        'masako': 'penyedap rasa',
        'himsalt': 'garam',
        'saori saus tiram': 'saus tiram',
        'kuning telur': 'telur',
        'putih telur': 'telur',
        'telur ayam': 'telur',
        'ragi instan': 'ragi',
        'fermipan': 'ragi',
        'soda kue': 'baking soda',
        'ragi instant': 'ragi',
        'tapioka': 'tepung tapioka',
        'terigu': 'tepung terigu',
        'maizena': 'tepung maizena',
        'choco chip': 'choco chips',
        'gula palm': 'gula aren',
        'gula merah / gula aren': 'gula aren',
    }
    if text in synonyms:
        text = synonyms[text]
    
    # Re-check stopwords after synonym resolution
    if text in stopwords_exact:
        return None
    
    text = text.strip()
    return text if len(text) > 2 else None


# === Build Knowledge Base ===
ingredient_kb = {}

for kelas in resep['Kelas_YOLO'].unique():
    df_kelas = resep[resep['Kelas_YOLO'] == kelas]
    
    all_bahan_kelas = df_kelas['List_Bahan'].explode()
    all_bahan_kelas = all_bahan_kelas[all_bahan_kelas.str.len() > 0]
    
    bahan_names = all_bahan_kelas.apply(extract_nama_bahan).dropna()
    
    bahan_counts = bahan_names.value_counts()
    
    threshold = max(2, len(df_kelas) * 0.20)
    top_bahan = bahan_counts[bahan_counts >= threshold].head(15).index.tolist()
    
    if not top_bahan:
        top_bahan = bahan_counts.head(5).index.tolist()
        
    ingredient_kb[kelas] = top_bahan

print(f"\nBerhasil membuat mapping bahan untuk {len(ingredient_kb)} kelas makanan.")

# === Verify: Print all unique ingredients ===
all_ingredients = set()
for ingredients in ingredient_kb.values():
    all_ingredients.update(ingredients)

print(f"Total unique ingredients across all classes: {len(all_ingredients)}")

# Write detailed report to file (avoid Windows console encoding issues)
report_path = 'c:/laragon/www/jivara/dataScience/scratch/kb_report.txt'
with open(report_path, 'w', encoding='utf-8') as report:
    report.write("=== All Unique Ingredients (sorted) ===\n")
    for ing in sorted(all_ingredients):
        report.write(f"  {ing}\n")
    
    report.write("\n=== Full Mappings ===\n")
    for k in sorted(ingredient_kb.keys()):
        report.write(f"  {k}: {ingredient_kb[k]}\n")

print(f"Detailed report saved to: {report_path}")

# === Print a few sample mappings ===
print("\n=== Sample Mappings ===")
for k in ['nasi-goreng', 'rendang', 'ayam-goreng-lengkuas', 'bakso', 'gado-gado', 'pizza', 'steak']:
    if k in ingredient_kb:
        print(f"  {k}: {ingredient_kb[k]}")

# === Save JSON ===
output_data = {
    "metadata": {
        "description": "Food-to-Ingredient Knowledge Base for 61 YOLO food classes",
        "total_classes": len(ingredient_kb),
        "source": "61_kelas_resep_cleaned.csv (Cookpad recipes)",
        "methodology": "Frequency-based extraction: ingredients appearing in >=20% of recipes per class, top 15",
        "version": "2.3-cleaned"
    },
    "food_to_ingredients": ingredient_kb
}

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"\nSaved cleaned KB to: {output_path}")
