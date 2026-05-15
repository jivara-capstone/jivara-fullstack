import streamlit as st
import pandas as pd
import json
from pathlib import Path

st.set_page_config(page_title="Jivara Dashboard", page_icon="🌿", layout="wide", initial_sidebar_state="expanded")

BASE = Path(__file__).resolve().parent
DATA = BASE.parent / "data_output"
PROC = DATA / "processed"
ASSET = BASE / "asset"

CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

*, html, body, [class*="css"] { font-family: 'Plus Jakarta Sans', sans-serif; }

/* Background utama off-white */
.stApp, [data-testid="stAppViewContainer"], [data-testid="stMain"],
[data-testid="stAppViewBlockContainer"], .block-container { background: #F7F8FA !important; }

/* Header atas hijau */
header[data-testid="stHeader"] { background: #2E7D32 !important; }
header[data-testid="stHeader"] button svg { color: #FFF !important; fill: #FFF !important; }

/* Sidebar toggle saat collapsed */
[data-testid="stSidebarCollapsedControl"] button svg { color: #333 !important; fill: #333 !important; }

/* Sidebar */
[data-testid="stSidebar"] { background: linear-gradient(175deg, #2E7D32 0%, #43A047 45%, #66BB6A 100%); }
[data-testid="stSidebar"] * { color: #FFF !important; }
[data-testid="stSidebar"] hr { border-color: rgba(255,255,255,0.22) !important; }
[data-testid="stSidebar"] img { border-radius: 8px; }

/* ── SEMUA TEKS DI MAIN AREA ── */
[data-testid="stMain"] p, [data-testid="stMain"] li,
[data-testid="stMain"] span, [data-testid="stMain"] td,
[data-testid="stMain"] th { color: #333 !important; }
[data-testid="stMain"] h1 { color: #1A1A1A !important; }
[data-testid="stMain"] h2 { color: #222 !important; }
[data-testid="stMain"] h3, [data-testid="stMain"] h4 { color: #2A2A2A !important; }
[data-testid="stMain"] strong { color: #222 !important; }

/* Widgets */
button { color: #333 !important; }
[data-testid="stSidebar"] button { color: #FFF !important; }
input, textarea { color: #333 !important; background: #FFF !important; }
[data-baseweb="select"], [data-baseweb="select"] span,
[data-baseweb="select"] div, [data-baseweb="select"] input { color: #333 !important; }
label, [data-testid="stWidgetLabel"] p,
[data-testid="stWidgetLabel"] span { color: #444 !important; font-weight: 500; }
[data-testid="stSidebar"] label,
[data-testid="stSidebar"] [data-testid="stWidgetLabel"] * { color: #FFF !important; }

/* Expander */
[data-testid="stExpander"] summary { background: #FFF !important; border: 1px solid #DEE2E6 !important; border-radius: 10px !important; }
[data-testid="stExpander"] summary * { color: #333 !important; font-weight: 600; }
[data-testid="stExpander"] [data-testid="stMarkdownContainer"] * { color: #444 !important; }

/* Captions, alerts, dataframe */
[data-testid="stCaptionContainer"] p { color: #6C757D !important; }
[data-testid="stAlert"] * { color: #333 !important; }
[data-testid="stDataFrame"] * { color: #333 !important; }

/* Metrics */
div[data-testid="stMetric"] {
    background: #FFF; border-radius: 14px; padding: 18px 22px;
    border: 1px solid #DEE2E6; border-left: 5px solid #43A047;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s;
}
div[data-testid="stMetric"]:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
div[data-testid="stMetric"] label { color: #555 !important; font-weight: 600; font-size: 0.82rem; }
div[data-testid="stMetric"] [data-testid="stMetricValue"] { color: #2E7D32 !important; font-weight: 800; }

/* Hero banner */
.hero-banner {
    background: linear-gradient(135deg, #2E7D32 0%, #43A047 40%, #66BB6A 100%);
    border-radius: 20px; padding: 44px 36px; text-align: center;
    box-shadow: 0 6px 24px rgba(46,125,50,0.18); margin-bottom: 30px;
    position: relative; overflow: hidden;
}
.hero-banner::before {
    content:''; position:absolute; top:-50%; right:-20%; width:400px; height:400px;
    background:radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%); border-radius:50%;
}
.hero-banner h1 { color: #FFF !important; font-size: 2.1rem; font-weight: 800; margin-bottom: 8px; position: relative; }
.hero-banner p { color: rgba(255,255,255,0.92) !important; font-size: 1rem; max-width: 700px; margin: 0 auto; line-height: 1.6; position: relative; }

/* Cards */
.glass-card {
    background: #FFF; border-radius: 16px; padding: 26px;
    border: 1px solid #DEE2E6; box-shadow: 0 1px 6px rgba(0,0,0,0.03);
    transition: transform 0.25s, box-shadow 0.25s; height: 100%;
}
.glass-card:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,0.07); border-color: #A5D6A7; }
.glass-card h3 { color: #2E7D32 !important; margin: 0 0 10px; font-weight: 700; font-size: 1.1rem; }
.glass-card p { color: #555 !important; font-size: 0.92rem; line-height: 1.6; margin-bottom: 12px; }

.badge {
    display: inline-block; background: #EDF7ED; color: #2E7D32;
    padding: 4px 14px; border-radius: 20px; font-size: 0.78rem;
    font-weight: 600; margin: 3px 2px; border: 1px solid #D4E8D4;
}

.section-title {
    color: #2E7D32 !important; font-weight: 700; font-size: 1.3rem;
    border-bottom: 3px solid #A5D6A7; padding-bottom: 8px;
    margin-bottom: 20px; display: inline-block;
}

.footer-text { text-align: center; color: #999; padding: 28px 0 10px; font-size: 0.85rem; }
.footer-text strong { color: #43A047; }

hr { border-color: #E5E7EB !important; }
</style>
"""
st.markdown(CSS, unsafe_allow_html=True)

# ── Sidebar ──
logo_path = ASSET / "splash.png"
if logo_path.exists():
    st.sidebar.image(str(logo_path), width=200)
st.sidebar.markdown("---")
st.sidebar.markdown("### Dashboard Jivara")
st.sidebar.markdown("*Stay On Track, Stay Healthy*")
st.sidebar.markdown("---")
st.sidebar.markdown("**Tim CC26-PSU090**")
st.sidebar.markdown("Data Science: Rizki Pangestu & La Rayan")
st.sidebar.markdown("AI Engineer: Hanif Rifan Ash Shidiq & Alfito Juanda")
st.sidebar.markdown("Full Stack Developer: Panji Ihsanudin Fajri & Rama Danadipa Putra Wijaya")
st.sidebar.markdown("---")
st.sidebar.markdown("Sprint: Mei 2026")

# ── Logo ──
text = ASSET / "notext.png"
if text.exists():
    _, cc, _ = st.columns([1.2, 2, 1.2])
    with cc:
        st.image(str(text), width=350)

# ── Hero ──
st.markdown("""
<div class="hero-banner">
    <h1>Jivara — Drug-Food Interaction System</h1>
    <p>Sistem cerdas yang mengintegrasikan deteksi makanan, analisis nutrisi, dan penalaran farmakologis
    untuk meningkatkan keselamatan pasien Indonesia</p>
</div>
""", unsafe_allow_html=True)

# ── KPIs ──
@st.cache_data
def load_stats():
    n_food = len(pd.read_csv(PROC / "unified_nutrition.csv"))
    n_drug = len(pd.read_csv(PROC / "obat_bpom_cleaned_dedup.csv"))
    with open(DATA / "for_backend" / "drug_food_kb_final.json", "r", encoding="utf-8") as f:
        kb = json.load(f)
    meta = kb.get("metadata", {})
    n_recipe = len(pd.read_csv(PROC / "61_kelas_resep_cleaned.csv"))
    return n_food, n_drug, meta, n_recipe

n_food, n_drug, meta, n_recipe = load_stats()

c1, c2, c3, c4, c5 = st.columns(5)
c1.metric("Data Nutrisi", f"{n_food:,}")
c2.metric("Obat BPOM", f"{n_drug:,}")
c3.metric("Kelas Makanan", "35")
c4.metric("Total Interaksi", f"{meta.get('total_global_interactions',0):,}")
c5.metric("Resep", f"{n_recipe:,}")

st.markdown("---")

# ── Project Summary ──
st.markdown('<div class="section-title">Ringkasan Proyek</div>', unsafe_allow_html=True)

col1, col2, col3 = st.columns(3, gap="medium")
with col1:
    st.markdown("""
    <div class="glass-card">
        <h3>Tujuan</h3>
        <p>Membangun sistem yang mendeteksi makanan Indonesia via kamera, menganalisis nutrisi,
        dan memberikan peringatan interaksi obat-makanan secara real-time.</p>
        <span class="badge">YOLOv11</span>
        <span class="badge">Knowledge Base</span>
        <span class="badge">Real-time</span>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="glass-card">
        <h3>Dataset</h3>
        <p>Pipeline data dari 3+ sumber: BPOM RI, Tabel Komposisi Pangan Indonesia (TKPI),
        Food-101, dan Cookpad Indonesia — diproses menjadi Single Truth database.</p>
        <span class="badge">1.476 Makanan</span>
        <span class="badge">15.085 Obat</span>
        <span class="badge">1.050 Resep</span>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown("""
    <div class="glass-card">
        <h3>Validasi</h3>
        <p>A/B Testing membuktikan Jivara meningkatkan kepatuhan minum obat (+16%)
        dan penghindaran makanan berbahaya (+37%) secara signifikan.</p>
        <span class="badge">p &lt; 0.05</span>
        <span class="badge">Effect Size: Besar</span>
        <span class="badge">Proof of Concept</span>
    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

# ── Research Questions ──
st.markdown('<div class="section-title">Research Questions</div>', unsafe_allow_html=True)

rqs = [
    ("RQ1", "Deteksi Agnostik", "Sejauh mana sistem mampu mendeteksi 35 kelas makanan Indonesia secara real-time?", "Target: Precision & Recall >= 85%"),
    ("RQ2", "Keamanan Medis", "Berapa tingkat sensitivitas AI dalam menangkap interaksi obat-makanan berbahaya?", "Target: False Negative Rate < 5%"),
    ("RQ3", "Kepatuhan Obat", "Apakah notifikasi peringatan efektif meningkatkan kepatuhan minum obat?", "Hasil: Peningkatan +16%"),
    ("RQ4", "Penghindaran Makanan", "Apakah Jivara membantu pasien menghindari makanan yang berinteraksi?", "Hasil: Peningkatan +37%"),
    ("RQ5", "Epidemiologi", "Tipe interaksi dan severity manakah yang paling prevalent?", "Analisis: 1.423 obat terindeks"),
]

for rq_id, title, desc, result in rqs:
    with st.expander(f"**{rq_id}: {title}** — {result}"):
        st.write(desc)

st.markdown("---")

# ── Navigation ──
st.markdown('<div class="section-title">Navigasi Dashboard</div>', unsafe_allow_html=True)

nc1, nc2, nc3 = st.columns(3, gap="medium")
with nc1:
    st.markdown('<div class="glass-card"><h3>Nutrisi & Resep</h3><p>Eksplorasi 1.476 data makanan, distribusi kalori, makronutrien, serta 1.050 resep lengkap dengan bahan dan langkah memasak.</p></div>', unsafe_allow_html=True)
with nc2:
    st.markdown('<div class="glass-card"><h3>Obat BPOM</h3><p>Analisis 15.085 produk obat terdaftar BPOM: golongan, bentuk sediaan, asal, dan kategori.</p></div>', unsafe_allow_html=True)
with nc3:
    st.markdown('<div class="glass-card"><h3>Interaksi & A/B Test</h3><p>Peta interaksi obat-makanan 35 kelas makanan & hasil A/B testing kepatuhan pasien.</p></div>', unsafe_allow_html=True)

st.markdown("---")
st.markdown('<div class="footer-text"><strong>Jivara</strong> — CC26-PSU090 | Capstone Project 2026<br><span style="font-size:0.8rem;">Stay On Track, Stay Healthy</span></div>', unsafe_allow_html=True)
