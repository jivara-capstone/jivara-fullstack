# Drug Product to Drug Category Mapping

Dokumen ini menjelaskan artefak mapping dari nama obat BPOM ke `drug_category`
yang dipakai oleh `drug_food_interactions.csv`.

## Konsep

`drug_category` adalah kategori farmakologi/terapi, bukan nama obat dan bukan
`Golongan_Obat` BPOM. Contoh: `statin`, `antidiabetes`, `ccb`, `nsaid`.

Alur lookup backend:

1. Normalisasi input nama obat pasien.
2. Cari di `drug_name_category_lookup.csv` melalui `lookup_name_norm`.
3. Ambil satu atau lebih `drug_category`.
4. Join ke `drug_food_interactions.csv` dengan `food_class + drug_category`.
5. Jika ada beberapa kategori, gunakan severity tertinggi untuk ringkasan dan
   tampilkan detail semua kategori yang match.

## Artefak

- `drug_active_category_map.csv`: kamus curated zat aktif ke `drug_category`.
- `drug_product_category_mapping.csv`: mapping produk BPOM ke `drug_category`.
- `drug_product_category_mapping_unmatched.csv`: zat aktif BPOM yang belum masuk
  kategori interaksi utama.
- `drug_name_category_lookup.csv`: lookup siap-backend yang menggabungkan nama
  produk dan alias zat aktif generik.

## Catatan

Mapping ini berbasis `Zat_Aktif`, bukan `Golongan_Obat`, karena `Golongan_Obat`
BPOM adalah kategori regulatori seperti `Obat Keras` atau `Obat Bebas`.

Semua rule diberi `source = curated_rule` dan perlu review farmasis sebelum
dipakai sebagai ground truth klinis final.
