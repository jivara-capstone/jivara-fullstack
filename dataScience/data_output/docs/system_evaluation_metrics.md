# 📊 Dokumentasi Metrik Evaluasi Sistem & Research Questions (RQ)
**Proyek Jivara (CC26-PSU090)**  
**Penanggung Jawab:** La Rayan & Rizki Pangestu (Data Science & Evaluator)

Dokumen ini mendefinisikan standar keberhasilan sistem Jivara dan menjabarkan **Pertanyaan Penelitian/Bisnis (RQ1-RQ5)** yang diukur melalui metode yang spesifik. Sistem dievaluasi dari dua pilar utama: Keandalan AI (Machine Learning) dan Keberhasilan Intervensi Pengguna (Bisnis/UX).

---

## A. Daftar Pertanyaan Bisnis (Research Questions - RQ)

Untuk memastikan produk ini memiliki *impact* pada kepatuhan pasien kesehatan di Indonesia, berikut 5 pilar pertanyaan analisis yang dijawab sistem Jivara:

1. **RQ1 (Deteksi Agnostik):** Sejauh mana sistem Jivara mampu mendeteksi 35 kelas makanan lokal Indonesia secara *real-time* dibandingkan batas kelayakan produksi?
2. **RQ2 (Keamanan Medis):** Berapa tingkat *sensitivitas* agen AI dalam menangkap insiden bahaya interaksi obat–makanan (mencegah absennya peringatan pada kondisi fatal)?
3. **RQ3 (Kepatuhan Jangka Pendek & Menengah):** Apakah pemberian notifikasi peringatan interaksi gizi terbukti efektif meningkatkan *Adherence Rate* (kepatuhan minum obat) kelompok pengguna uji dalam rentang 7 dan 30 hari?
4. **RQ4 (UX & Effectiveness):** Bagaimana rasio korelasi linear antara frekuensi interaksi pengguna dengan *reminder* aplikasi (melalui CTR) terhadap efektivitas jadwal konsumsi?
5. **RQ5 (Epidemiologi Data):** Dari 1.423 obat dan bahan dasar masakan lokal, tipe interaksi obat-makanan dan level keparahan (*severity*) manakah yang memiliki prevalensi atau probabilitas kejadian terekam paling tinggi?

---

## B. Metrik Evaluasi (Key Performance Indicators)

### 1. Performa Model AI (Deteksi Makanan YOLOv11)
Karena sistem Jivara bergantung pada kemampuan identifikasi kamera pasien, model harus sangat akurat. Batas batas standar penerimaan untuk produksi (Production Grade) proyek ini adalah:
- **Precision (Presisi) ≥ 85%**: Dari seluruh makanan yang *ditebak* sistem sebagai "Rendang", pastikan 85% di antaranya benar-benar Rendang (Meminimalisir salah tebak interaksi).
- **Recall (Sensitivitas) ≥ 85%**: Dari seluruh gambar Rendang aktual yang difoto pengguna, 85% berhasil terdeteksi sebagai Rendang oleh batas *bounding box* sistem.

### 2. Akurasi Interaksi Obat Berbasis Knowledge-Base (Safety Metric)
Sistem kesehatan memiliki risiko tinggi. Lebih baik sistem *over-warning* daripada melewatkan peringatan serius.
- **False Negative Rate (FNR) < 5%**: Parameter terpenting di sistem Pakar Medis. Persentase di mana sistem "gagal memberikan peringatan" pada saat pengguna memakan makanan yang **seharusnya terdeteksi fatal (Misal: Tyramine + MAOI)** harus di bawah 5%.

### 3. Tingkat Kepatuhan Pengguna (Business & UX)
Sistem Jivara harus secara medis mengintervensi kebiasaan buruk masyarakat Indonesia berdasarkan *survei literatur ketidakpatuhan pasien Indonesia*. Diukur dengan metode observasi A/B Testing:
- **Adherence Rate (7 Hari)**: Persentase dosis minum obat yang dikonsumsi tepat waktu tanpa interaksi fatal terhadap jadwal total per minggu (Target: Baseline Peningkatan Minimal +15%).
- **Adherence Rate (30 Hari)**: Persentase konsistensi kepatuhan regimen jangka menengah untuk penyakit kronis (Hipertensi, TB).

### 4. Efektivitas Reminder Notification 
- **Response Rate**: Waktu jeda rata-rata (TTO - Time To Open) pengguna merespons alarm/notifikasi ponsel dibandingkan waktu penegasan (dispensing) obatnya.
- **Click-Through Rate (CTR)**: Persentase seberapa sering peringatan *Knowledge Base Interaksi Obat* (saat Severity ≥ 3) diklik pengguna untuk membaca literatur farmasinya.

---

## C. Metodologi A/B Testing & Rencana Analisis
Tingkat *Adherence* (Kepatuhan) akan divalidasi menggunakan A/B Testing dengan prosedur:
*   **Grup A (Control):** Pasien menggunakan kalender pengingat jam minum obat konvensional (tanpa scan foto makanan / peringatan Drug Interaction).
*   **Grup B (Treatment):** Pasien menggunakan fitur utuh Jivara dengan deteksi YOLOv11 dan filter interaksi senyawa obat dari database.

**Uji Hipotesis:**
*   *H0:* Penggunaan sistem peringatan makanan Jivara tidak memiliki perbedaan signifikan pada Adherence Rate.
*   *H1:* Penggunaan sistem peringatan makanan Jivara mendongkrak signifikan Adherence Rate 7 hari.

Analisis akhir akan diterbitkan dalam laporan EDA komprehensif oleh Evaluator Sistem menggunakan metode uji signifikansi (P-Value < 0.05).
