# 📖 Data Dictionary — Jivara Project
**Role**: Data Science (Rizki Pangestu)  
**Tujuan**: Kamus rujukan untuk tim Backend dan representasi metadata tabel.

---

## 1. Tabel Utama: `unified_nutrition.csv`
Tabel ini merupakan gabungan dari `nutrition1.csv` (Indonesia), 101 makanan dari `nutrition.csv` (Global), serta referensi gizi manual yang disempurnakan. Digunakan oleh Jivara App sebagai *Single Truth* nutrisi.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `food_id` | Integer | Primary key unik. |
| `food_name` | String | Nama makanan dalam format standar (Kapital di awal kalimat). |
| `food_name_en` | String | Nama makanan dalam terjemahan bahasa Inggris (bila tersedia). |
| `source` | String | Sumber nutrisi (`nutrition1_indonesia`, `food101_global`, `manual_curated_indo`). |
| `calories` | Float | Jumlah kalori dalam satuan **Kcal** per berat porsi (biasanya 100g). |
| `proteins` | Float | Jumlah total protein dalam satuan **Gram** per porsi. |
| `fat` | Float | Jumlah total lemak dalam satuan **Gram** per porsi. |
| `carbohydrate`| Float | Jumlah total karbohidrat dalam satuan **Gram** per porsi. |
| `weight_grams` | Float | Standar basis porsi (default: 100 gram). |
| `fiber` | Float | Total serat makanan (Gram). Kosong (NaN) pada dataset asli ID. |
| `sugars` | Float | Total kadar gula (Gram). |
| `sodium` | Float | Kandungan natrium (Miligram) — Sangat penting untuk deteksi penyakit Hipertensi. |

---

## 2. Tabel Pemetaan: `mapping_image_nutrition.csv`
Berfungsi sebagai jembatan (Look-Up Table) yang memetakan output klasifikasi gambar dari AI ke tabel Nutrisi di database Backend.

| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| `image_category` | String | Nama kelas (*folder name*) yang dipakai YOLOv11 Computer Vision. Format: kebab-case. |
| `nutrition_food_name` | String | *Foreign Key* yang merujuk persis / 100% (exact match) ke `food_name` di tabel Nutrisi. |
| `status` | String | Status ketersambungan (VERIFIED_EXACT, MAPPED_BUT_NOT_FOUND). Semua data kini 100% VERIFIED_EXACT. |
| `calories` | Float | Fitur ekstraksi langsung pembacaan nilai kalori atas makanan tersebut untuk pengecekan referensi. |

---

## 3. Knowledge Base Interaksi Obat: `drug_food_kb_final.json`
Basis data graf non-relasional yang digunakan oleh *AI Reasoning Agent*.

| Kunci (Key) Utama | Keterangan Struktur Dalamnya |
|-------------------|-----------------------------|
| `metadata` | Menyimpan *versioning* dan rekap hasil ekstraksi Knowledge Base (Total Makanan & Total Obat Global). |
| `local_food_to_drug_mapping` | Berisi daftar lengkap (dict) yang menampung 35 makanan lokal sebagai Key. Di dalamnya terdapat *array* `drug_interactions` yang menyimpan detil *Severity* (Skala 1 s.d 5), *Mechanisms*, serta kelas obat yang bersinggungan. |
| `global_drug_to_food_mapping` | Berisi 1.423 jenis obat Global farmasi dari dataset FoodBank, di mana *array text*-nya telah dilakukan *NLP Parsing* menjadi level `AVOID`, `MONITOR`, `LIMIT`, dan skor keparahan. |

> **Cara Penggunaan JSON ini untuk Backend/API:**  
> Ketika user makan "Gado-gado" & meminum "Tranylcypromine (MAOI)", panggil `knowledge_base["local_food_to_drug_mapping"]["gado-gado"]`. Jika terdapat interaksi kritikal `severity: 5` terhadap golongan MAOI (karena ada tyramine dari tempe), backend wajib menyalakan pop-up Notification "FATAL WARNING".
