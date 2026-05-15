# 📊 Jivara Dashboard — Dokumentasi

**Proyek:** Jivara (CC26-PSU090) — Drug-Food Interaction Detection System  
**Dibuat oleh:** Tim Data Science  
**Teknologi:** Streamlit · Plotly · Pandas · SciPy  
**Terakhir diperbarui:** Mei 2026

---

## 📌 Gambaran Umum

Dashboard interaktif ini menyajikan seluruh insight utama dari proyek Jivara secara visual dan mudah dipahami oleh seluruh stakeholder (Data Science, AI Engineer, Backend, dan Mentor). Dashboard dibangun menggunakan **Streamlit** dengan tema warna hijau-putih sesuai branding Jivara.

### Fitur Utama
- 🎨 Desain konsisten dengan tema hijau-putih dan logo Jivara
- 📊 Visualisasi interaktif menggunakan Plotly
- 🔍 Pencarian dan filter data real-time
- 📱 Responsive layout untuk presentasi

---

## 🚀 Cara Menjalankan

### Prasyarat
Pastikan package berikut sudah terinstal:
```bash
pip install streamlit pandas plotly scipy numpy
```

### Menjalankan Dashboard
```bash
cd dataScience/dashboard
streamlit run dashboard.py
```

Dashboard akan terbuka di browser pada `http://localhost:8501`

---

## 📑 Deskripsi Setiap Halaman

### 🏠 Home (`dashboard.py`)

Halaman utama yang memberikan gambaran besar proyek Jivara.

| Komponen | Deskripsi |
|----------|-----------|
| Hero Banner | Judul proyek dan deskripsi singkat sistem |
| KPI Metrics | 5 angka kunci: total nutrisi, obat, kelas makanan, interaksi, resep |
| Ringkasan Proyek | 3 kartu: Tujuan, Dataset, Validasi |
| Research Questions | 5 RQ yang dijawab oleh sistem (RQ1–RQ5) dalam format expandable |
| Navigasi | Panduan menuju halaman-halaman detail |

### 🥗 Halaman Nutrisi (`pages/1_Nutrisi.py`)

Eksplorasi database nutrisi **1.476 makanan** dari 3 sumber.

| Visualisasi | Deskripsi |
|-------------|-----------|
| Pie Chart Makronutrien | Distribusi kategori: High Carb, Balanced, High Fat, High Protein |
| Bar Chart Sumber Data | Komposisi sumber: TKPI Indonesia, Food-101 Global, Manual Curated |
| Top 15 Kalori | Horizontal bar chart makanan berkalori tertinggi |
| Distribusi Nutrisi | Histogram interaktif (kalori/protein/lemak/karbo/natrium) |
| Scatter Korelasi | Plot korelasi antar makronutrien dengan warna per kategori |
| Pencarian | Input teks untuk mencari makanan berdasarkan nama |

**Sumber Data:** `data_output/processed/unified_nutrition.csv`

### 💊 Halaman Obat BPOM (`pages/2_Obat_BPOM.py`)

Analisis **15.085 produk obat** terdaftar di BPOM RI.

| Visualisasi | Deskripsi |
|-------------|-----------|
| Pie Chart Golongan | Obat Keras, Bebas Terbatas, Bebas, Psikotropika, dll. |
| Bar Chart Bentuk Sediaan | Top 10: Tablet, Sirup, Injeksi, Kapsul, Krim, dll. |
| Asal Obat | Perbandingan Lokal (12.884) vs Impor (2.201) |
| Kategori Obat | Top 8 kategori registrasi |
| Pencarian | Filter produk berdasarkan nama |

**Sumber Data:** `data_output/processed/obat_bpom_cleaned_dedup.csv`

### ⚠️ Halaman Interaksi & A/B Testing (`pages/3_Interaksi_AB_Test.py`)

Knowledge Base farmakologis dan validasi efektivitas Jivara.

| Visualisasi | Deskripsi |
|-------------|-----------|
| KPI Overview | 1.423 obat terindeks, 35 makanan lokal, 2.512 interaksi |
| Severity Distribution | Bar chart level severity 1–5 |
| Tipe Interaksi | Pie chart AVOID / MONITOR / LIMIT |
| Heatmap | Matriks severity per makanan × kelas obat |
| Eksplorasi per Makanan | Detail interaksi: obat contoh, mekanisme, severity |
| A/B Testing RQ3 | Violin plot kepatuhan minum obat: +16% peningkatan |
| A/B Testing RQ4 | Violin plot penghindaran makanan: +37% peningkatan |

**Sumber Data:** `data_output/for_backend/drug_food_kb_final.json`

### 🍳 Halaman Resep & Bahan (`pages/4_Resep_Bahan.py`)

Eksplorasi **1.050 resep** dari 61 kelas makanan Indonesia.

| Visualisasi | Deskripsi |
|-------------|-----------|
| Tingkat Kompleksitas | Pie chart: Sederhana, Menengah, Kompleks |
| Resep per Kelas | Top 15 kelas makanan berdasarkan jumlah resep |
| Top 25 Bahan | Bahan paling sering digunakan di seluruh resep |
| Distribusi Bahan & Langkah | Histogram jumlah bahan dan langkah per resep |
| Bahan vs Kompleksitas | Box plot korelasi jumlah bahan dengan tingkat kesulitan |
| Eksplorasi per Kelas | Pilih kelas → lihat bahan populer + detail resep (bahan & langkah) |

**Sumber Data:** `data_output/processed/61_kelas_resep_cleaned.csv`

---

## 🎨 Design System

Dashboard menggunakan design system yang konsisten di seluruh halaman:

| Elemen | Spesifikasi |
|--------|-------------|
| **Font** | Plus Jakarta Sans (Google Fonts) |
| **Background** | `#F6FBF4` (off-white hijau lembut) |
| **Sidebar** | Gradient: `#0D3B0D → #1B5E20 → #2E7D32` |
| **Accent Hijau** | `#1B5E20` (gelap) → `#4CAF50` (medium) → `#C8E6C9` (terang) |
| **Teks Utama** | `#37474F` (dark blue-grey) |
| **Teks Sekunder** | `#546E7A` (medium grey) |
| **Kartu** | Glassmorphism: semi-transparan, border `#C8E6C9`, hover lift |
| **Metrics** | White-to-green gradient, border-left hijau, hover animation |
| **Charts** | Background transparan, grid `#E8F5E9`, green color scale |

---

## 📊 Sumber Data yang Digunakan

| File | Lokasi | Deskripsi | Jumlah Record |
|------|--------|-----------|---------------|
| `unified_nutrition.csv` | `data_output/processed/` | Database nutrisi gabungan (TKPI + Food-101 + Manual) | 1.476 |
| `obat_bpom_cleaned_dedup.csv` | `data_output/processed/` | Produk obat terdaftar BPOM (deduplikasi) | 15.085 |
| `drug_food_kb_final.json` | `data_output/for_backend/` | Knowledge Base interaksi obat-makanan | 1.423 obat, 35 makanan |
| `61_kelas_resep_cleaned.csv` | `data_output/processed/` | Resep makanan Indonesia dari Cookpad | 1.050 |

---

## 👥 Tim

| Role | Anggota |
|------|---------|
| 📊 Data Science | Rizki Pangestu & La Rayan |
| 🤖 AI Engineer | Hanif Rifan Ash Shidiq & Alfito Juanda |
| 👨‍💻 Full Stack Developer | Panji Ihsanudin Fajri & Rama Danadipa Putra Wijaya |

---

## 📝 Catatan

- Data A/B Testing menggunakan **simulasi** sebagai proof-of-concept (N=150 per grup). Validasi dengan data pengguna nyata diperlukan sebelum deployment.
- Dashboard membutuhkan koneksi ke folder `data_output/` untuk membaca dataset. Pastikan path relatif sesuai.
- Streamlit akan auto-reload saat file `.py` diubah.

---

> 🌿 **Jivara** — *Stay On Track, Stay Healthy*
