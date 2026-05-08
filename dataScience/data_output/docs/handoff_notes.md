# 🚀 HANDOFF NOTES
**Dari:** Rizki Pangestu (Data Science)  
**Kepada:** La Rayan (AI Engineer) & Rama / Alfiantok (Cloud & Backend)  
**Proyek:** Jivara (CC26-PSU090)  
**Tanggal:** Sprint Penyelesaian Data Utama

Halo Tim Jivara,

Rangkaian kerja Data Science / Data Prep telah diselesaikan **100%** lebih awal dari target (menyelesaikan 7 hari sprint di awal siklus). Semua data telah terverifikasi, bebas duplikat, terstruktur, dan siap masuk tahap development YOLO (AI) maupun API (Backend).

Berikut adalah penyerahan (*handoff*) dokumen dan panduannya:

---

### 📷 UNTUK AI ENGINEER (LA RAYAN)
Anda sekarang dapat menjalankan training YOLOv11 menggunakan folder data gambar dari `archive (17)`. Anda tidak perlu membuat list array kelas *(train, val, test)* dari awal.
1. Gunakan file konfigurasi `data_output/for_ai_engineer/classes.yaml` yang baru saya generate. 
2. File ini memuat **35 kelas makanan** urut alfabetis sesuai standar YOLO.
3. Kami juga sudah menjalin "Jembatan Pemetaan / Mapping". Jadi ketika YOLO mendeteksi gambar "*soto-ayam-lamongan*", AI kita dipastikan akan mencari indeks `"Soto ayam lamongan"` di database. Tidak akan ada error nama kelas.

### 🌐 UNTUK BACKEND & CLOUD ENGINEER (RAMAdsb)
Terdapat 2 file utama di folder `data_output` siap untuk di-*load* atau divalidasi ke Cloud SQL/Firestore kalian:
1. **`data_output/processed/unified_nutrition.csv`**: Ini adalah database nutrisi tunggal. Total 1.459 baris tanpa duplikat. (Ada injeksi manual 21 makanan Indonesia oleh tim DS karena data tersebut absen dalam global standard gizi).
2. **`data_output/for_backend/drug_food_kb_final.json`**: Ini adalah *Knowledge Base* untuk Agen AI Reasoning kalian (LLM prompt context atau Rule-Engine API). 
   - Di dalamnya, ada mapping langsung *Drug Interactions* ke 35 makanan dari daftar gambar. Skala *Severity* sudah distrukturisasi dari skor 1 s.d 5, dan skor tipe NLP Parser seperi `[AVOID, LIMIT, MONITOR]`. (Mohon dibantu bikin Notification fatal di frontend jika severity mencatatkan >= 4).

### 📖 DOKUMENTASI REFERENSI (SEMUA ANGGOTA)
Sila buka folder `data_output/docs/`. Saya telah menempatkan file `data_dictionary.md` jika kalian lupa mengenai definisi kolom seperti `sodium` atau `fiber`, maupun hierarki parameter pada JSON kita.

Semoga berhasil! Kabari jika ada pertanyaan.
- *Rizki (Data Scientist)*
