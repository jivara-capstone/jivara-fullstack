import json

notebook_path = 'c:/laragon/www/jivara/dataScience/notebooks/Cookpad_Resep_Data_Processing.ipynb'
with open(notebook_path, 'r', encoding='utf-8') as f:
    notebook = json.load(f)

new_source = '''def extract_nama_bahan(text):
    """Ambil nama bahan, hilangkan kuantitas dan noise lainnya."""
    import re
    
    # 1. Lowercase dulu agar seragam
    text = text.lower().strip()
    
    # 2. Hapus teks dalam kurung (...) misal: bawang putih (diuleg)
    text = re.sub(r'\\(.*?\\)', '', text)
    
    # 3. Hapus deskripsi cara potong/olah setelah koma misal: wortel , potong korek api
    text = text.split(',')[0].strip()
    
    # Bersihkan simbol-simbol aneh di awal dan akhir teks seperti ":" atau "-"
    text = re.sub(r'^[\\s:\\-.,]+', '', text)
    text = re.sub(r'[\\s:\\-.,]+$', '', text)
    
    # 4. Hapus stop words awal/akhir
    stopwords_exact = [
        'bahan a', 'bahan b', 'bahan c', 'bahan d', 'bahan acar', 'bahan basah', 
        'bahan bumbu', 'bahan isian', 'bahan kuah kinca', 'bahan kulit', 'bahan salad', 
        'bahan saus', 'bahan serundeng', 'bumbu halus', 'bumbu kacang', 'bumbu marinasi', 
        'bumbu', 'kuah santan', 'pelengkap', 'topping', 'untuk papeda', 'es batu', 'air', 
        'air putih', 'air matang', 'air hangat', 'minyak goreng', 'minyak', 'garam', 'gula', 
        'penyedap', 'kaldu bubuk', 'micin', 'air kelapa', 'air asam jawa', 'krupuk', 'kerupuk', 'bahan'
    ]
    
    if text in stopwords_exact:
        return None
        
    for stop in stopwords_exact:
        if text.startswith(stop + ":") or text == stop:
            return None

    # 5. Hilangkan kuantitas angka di awal
    text = re.sub(r'^[\\d\\s,./]+', '', text).strip()
    
    # 6. Hilangkan satuan pengukuran yang lebih lengkap
    satuan = [
        'sdm', 'sdt', 'gram', 'gr', 'kg', 'ml', 'liter', 'lt', 'buah', 'bh', 'butir', 
        'siung', 'lembar', 'lbr', 'batang', 'ruas', 'porsi', 'piring', 'mangkok', 
        'bungkus', 'sachet', 'secukupnya', 'sejumput', 'sesuai selera', 'ikat', 
        'genggam', 'segenggam', 'jempol', 'sendok teh', 'sendok makan', 'cm', 'tsp',
        'papan', 'bonggol', 'keping', 'g'
    ]
    pattern_satuan = r'^(?:' + '|'.join(satuan) + r')\\s*'
    text = re.sub(pattern_satuan, '', text, flags=re.IGNORECASE).strip()
    
    # Ulangi lagi hapus angka jika ada
    text = re.sub(r'^[\\d\\s,./]+', '', text).strip()
    
    # 7. Hilangkan instruksi di akhir teks
    instruksi = [
        'untuk menumis', 'untuk menggoreng', 'untuk membungkus', 'potong sesuai selera'
    ]
    for inst in instruksi:
        text = text.replace(inst, '').strip()
        
    # 8. Beberapa nama bahan sering disingkat
    text = text.replace('b.merah', 'bawang merah')
    text = text.replace('b.putih', 'bawang putih')
    text = text.replace('kental manis cap enaak', 'susu kental manis')
    
    text = text.strip()
    return text if len(text) > 2 else None

# Buat Knowledge Base Dictionary
ingredient_kb = {}

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

print(f"Berhasil membuat mapping bahan untuk {len(ingredient_kb)} kelas makanan.")
print("\\nContoh Mapping:")
for k in ['nasi-goreng', 'rendang', 'ayam-goreng-lengkuas']:
    if k in ingredient_kb:
        print(f"  - {k}: {ingredient_kb[k]}")
'''

modified = False
for cell in notebook['cells']:
    if cell['cell_type'] == 'code':
        source = ''.join(cell['source'])
        if 'def extract_nama_bahan(text):' in source:
            cell['source'] = [line + '\\n' for line in new_source.split('\\n')]
            cell['source'][-1] = cell['source'][-1].strip('\\n') # remove last newline
            modified = True
            break

if modified:
    with open(notebook_path, 'w', encoding='utf-8') as f:
        json.dump(notebook, f, indent=1)
    print('Successfully modified notebook.')
else:
    print('Could not find the function in the notebook.')
