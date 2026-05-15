import streamlit as st, pandas as pd, numpy as np, plotly.express as px, json
from pathlib import Path
from scipy.stats import ttest_ind

st.set_page_config(page_title="Interaksi & AB Test - Jivara", page_icon="🌿", layout="wide")
P = Path(__file__).resolve().parent.parent
DATA = P.parent / "data_output"
ASSET = P / "asset"
KB_PATH = DATA / "for_backend" / "drug_food_kb_final.json"

st.markdown("""<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
*,html,body,[class*="css"]{font-family:'Plus Jakarta Sans',sans-serif}
.stApp,[data-testid="stAppViewContainer"],[data-testid="stMain"],[data-testid="stAppViewBlockContainer"],.block-container{background:#F7F8FA!important}
header[data-testid="stHeader"]{background:#2E7D32!important}
header[data-testid="stHeader"] button svg{color:#FFF!important;fill:#FFF!important}
[data-testid="stSidebarCollapsedControl"] button svg{color:#333!important;fill:#333!important}
[data-testid="stSidebar"]{background:linear-gradient(175deg,#2E7D32 0%,#43A047 45%,#66BB6A 100%)}
[data-testid="stSidebar"] *{color:#FFF!important}
[data-testid="stSidebar"] hr{border-color:rgba(255,255,255,0.22)!important}
[data-testid="stMain"] p,[data-testid="stMain"] li,[data-testid="stMain"] span,[data-testid="stMain"] td,[data-testid="stMain"] th{color:#333!important}
[data-testid="stMain"] h1{color:#1A1A1A!important}[data-testid="stMain"] h2{color:#222!important}
[data-testid="stMain"] h3,[data-testid="stMain"] h4{color:#2A2A2A!important}
[data-testid="stMain"] strong{color:#222!important}
button{color:#333!important}[data-testid="stSidebar"] button{color:#FFF!important}
input,textarea{color:#333!important;background:#FFF!important}
[data-baseweb="select"],[data-baseweb="select"] span,[data-baseweb="select"] div,[data-baseweb="select"] input{color:#333!important}
label,[data-testid="stWidgetLabel"] p,[data-testid="stWidgetLabel"] span{color:#444!important;font-weight:500}
[data-testid="stSidebar"] label,[data-testid="stSidebar"] [data-testid="stWidgetLabel"] *{color:#FFF!important}
[data-testid="stExpander"] summary{background:#FFF!important;border:1px solid #DEE2E6!important;border-radius:10px!important}
[data-testid="stExpander"] summary *{color:#333!important;font-weight:600}
[data-testid="stExpander"] [data-testid="stMarkdownContainer"] *{color:#444!important}
[data-testid="stCaptionContainer"] p{color:#6C757D!important}
[data-testid="stAlert"] *{color:#333!important}
[data-testid="stDataFrame"] *{color:#333!important}
div[data-testid="stMetric"]{background:#FFF;border-radius:14px;padding:18px 22px;border:1px solid #DEE2E6;border-left:5px solid #43A047;box-shadow:0 1px 6px rgba(0,0,0,0.04)}
div[data-testid="stMetric"] label{color:#555!important;font-weight:600;font-size:0.82rem}
div[data-testid="stMetric"] [data-testid="stMetricValue"]{color:#2E7D32!important;font-weight:800}
.page-header{background:linear-gradient(135deg,#2E7D32 0%,#43A047 40%,#66BB6A 100%);border-radius:18px;padding:30px 34px;margin-bottom:26px;box-shadow:0 6px 20px rgba(46,125,50,0.16)}
.page-header h2{color:#FFF!important;font-weight:800;margin:0 0 6px}
.page-header p{color:rgba(255,255,255,0.9)!important;margin:0;font-size:0.95rem}
.section-title{color:#2E7D32!important;font-weight:700;font-size:1.3rem;border-bottom:3px solid #A5D6A7;padding-bottom:8px;margin-bottom:20px;display:inline-block}
.result-card{background:#FFF;border-radius:16px;padding:24px;border:1px solid #DEE2E6;box-shadow:0 1px 8px rgba(0,0,0,0.04);text-align:center}
.result-card h4{color:#2E7D32!important;margin:0 0 8px}
.result-big{font-size:2.2rem;font-weight:800;color:#2E7D32}
.result-sub{font-size:0.85rem;color:#777;margin-top:4px}
hr{border-color:#E5E7EB!important}
</style>""", unsafe_allow_html=True)

logo = ASSET / "splash.png"
if logo.exists(): st.sidebar.image(str(logo), width=200)
st.sidebar.markdown("---")
st.sidebar.markdown("### Interaksi & A/B Test")
st.sidebar.markdown("*Analisis Keselamatan Pasien*")

PL = dict(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
          font=dict(family="Plus Jakarta Sans", color="#333", size=14), margin=dict(l=20,r=20,t=50,b=20),
          title_font=dict(size=16, color="#2E7D32", family="Plus Jakarta Sans"))

@st.cache_data
def load_kb():
    with open(KB_PATH, "r", encoding="utf-8") as f: return json.load(f)

kb = load_kb()
meta = kb.get("metadata", {})
foods = kb.get("local_ingredient_safety_registry", {})

st.markdown('<div class="page-header"><h2>Interaksi Obat-Makanan & Hasil A/B Testing</h2><p>Knowledge Base farmakologis dan validasi efektivitas sistem Jivara</p></div>', unsafe_allow_html=True)

c1, c2, c3 = st.columns(3)
c1.metric("Obat Terindeks", f"{meta.get('total_drugs_indexed',0):,}")
c2.metric("Makanan Lokal", f"{meta.get('indonesian_classes_covered',0)}")
c3.metric("Total Interaksi", f"{meta.get('total_global_interactions',0):,}")

st.markdown("---")
st.markdown('<div class="section-title">Peta Interaksi 35 Makanan Indonesia</div>', unsafe_allow_html=True)

rows = []
for fname, fdata in foods.items():
    for inter in fdata.get("drug_interactions", []):
        rows.append({"Makanan": fname, "Kelas_Obat": inter.get("drug_class",""),
                      "Severity": inter.get("severity",0), "Tipe": inter.get("type",""),
                      "Mekanisme": inter.get("mechanism","")})
idf = pd.DataFrame(rows) if rows else pd.DataFrame()

if not idf.empty:
    col1, col2 = st.columns(2, gap="medium")
    with col1:
        sev = idf['Severity'].value_counts().sort_index().reset_index()
        sev.columns = ['Severity','Count']
        fig = px.bar(sev, x='Severity', y='Count', text='Count',
                     color='Severity', color_continuous_scale=[[0,'#C8E6C9'],[0.5,'#FFE082'],[1,'#EF5350']])
        fig.update_traces(textposition='outside', textfont_size=14, textfont_color="#333")
        fig.update_layout(**PL, height=400, title="Distribusi Severity Level",
                          coloraxis_showscale=False,
                          xaxis=dict(dtick=1, showgrid=False, tickfont=dict(size=13, color="#333"),
                                     title=dict(text="Severity Level", font=dict(size=13, color="#555"))),
                          yaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555"),
                                     title=dict(text="Jumlah Interaksi", font=dict(size=13, color="#555"))))
        st.plotly_chart(fig, key="bar_severity", width="stretch")
    with col2:
        tc = idf['Tipe'].value_counts().reset_index()
        tc.columns = ['Tipe','Count']
        fig = px.pie(tc, names='Tipe', values='Count', hole=0.45,
                     color='Tipe', color_discrete_map={'AVOID':'#EF5350','MONITOR':'#FFB74D','LIMIT':'#66BB6A'})
        fig.update_traces(textposition='inside', textinfo='percent+label', textfont_size=14)
        fig.update_layout(**PL, height=400, title="Tipe Interaksi",
                          legend=dict(font=dict(size=13, color="#333")))
        st.plotly_chart(fig, key="pie_tipe", width="stretch")

    st.markdown('<div class="section-title">Heatmap Severity per Makanan</div>', unsafe_allow_html=True)
    hm = idf.groupby(['Makanan','Kelas_Obat'])['Severity'].max().reset_index()
    hm_pivot = hm.pivot_table(index='Makanan', columns='Kelas_Obat', values='Severity', fill_value=0)
    fig = px.imshow(hm_pivot, color_continuous_scale=[[0,'#E8F5E9'],[0.3,'#FFF9C4'],[0.6,'#FFE082'],[1,'#EF5350']],
                    aspect='auto', labels=dict(color="Severity"))
    fig.update_layout(**PL, height=600,
                      xaxis=dict(tickfont=dict(size=11, color="#333")),
                      yaxis=dict(tickfont=dict(size=12, color="#333")))
    st.plotly_chart(fig, key="heatmap_sev", width="stretch")

    st.markdown("---")
    st.markdown('<div class="section-title">Eksplorasi Interaksi per Makanan</div>', unsafe_allow_html=True)
    sel = st.selectbox("Pilih makanan:", sorted(foods.keys()), format_func=lambda x: x.replace('-',' ').title())
    if sel:
        fd = foods[sel]
        st.markdown(f"**Kategori:** `{fd.get('category','-')}` | **Bahan Utama:** {', '.join(fd.get('key_ingredients',[]))}")
        for ix in fd.get("drug_interactions", []):
            sv = ix['severity']
            label = ['Rendah','Rendah-Sedang','Sedang','Tinggi','Kritis'][min(sv-1,4)]
            with st.expander(f"{ix['drug_class']} — Severity {sv}/5 ({ix['type']}) — {label}"):
                st.markdown(f"**Contoh Obat:** {', '.join(ix.get('drug_examples',[]))}")
                st.markdown(f"**Interaksi:** {ix.get('interaction','')}")
                st.markdown(f"**Mekanisme:** `{ix.get('mechanism','')}`")

st.markdown("---")
st.markdown('<div class="section-title">Hasil A/B Testing — Efektivitas Jivara</div>', unsafe_allow_html=True)
st.caption("Data Simulasi — Proof of Concept | N = 150 pasien per grup | alpha = 0.05")

np.random.seed(42); N=150
beta_fn = lambda mu,n: np.random.beta(mu*30,(1-mu)*30,n)
ctrl_adh, treat_adh = beta_fn(0.62,N), beta_fn(0.78,N)
ctrl_avoid, treat_avoid = beta_fn(0.35,N), beta_fn(0.72,N)
_, p1 = ttest_ind(treat_adh, ctrl_adh, equal_var=False)
_, p2 = ttest_ind(treat_avoid, ctrl_avoid, equal_var=False)

col1, col2 = st.columns(2, gap="medium")
with col1:
    st.markdown(f'<div class="result-card"><h4>RQ3: Kepatuhan Minum Obat</h4><div class="result-big">+{treat_adh.mean()-ctrl_adh.mean():.0%}</div><div class="result-sub">{ctrl_adh.mean():.0%} → {treat_adh.mean():.0%} | p = {p1:.4f}</div></div>', unsafe_allow_html=True)
with col2:
    st.markdown(f'<div class="result-card"><h4>RQ4: Penghindaran Makanan Berbahaya</h4><div class="result-big">+{treat_avoid.mean()-ctrl_avoid.mean():.0%}</div><div class="result-sub">{ctrl_avoid.mean():.0%} → {treat_avoid.mean():.0%} | p = {p2:.4f}</div></div>', unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)
ab = pd.DataFrame({"Grup": ["Tanpa Jivara"]*N+["Dengan Jivara"]*N,
    "Kepatuhan Obat": np.concatenate([ctrl_adh, treat_adh]),
    "Penghindaran Makanan": np.concatenate([ctrl_avoid, treat_avoid])})

col1, col2 = st.columns(2, gap="medium")
with col1:
    fig = px.violin(ab, x="Grup", y="Kepatuhan Obat", color="Grup", box=True, points="outliers",
                    color_discrete_map={"Tanpa Jivara":"#EF5350","Dengan Jivara":"#1976D2"})
    fig.update_layout(**PL, height=420, title="RQ3: Distribusi Kepatuhan Obat",
                      showlegend=False, yaxis_tickformat='.0%',
                      xaxis=dict(tickfont=dict(size=14, color="#333")),
                      yaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555")))
    st.plotly_chart(fig, key="violin_adh", width="stretch")
with col2:
    fig = px.violin(ab, x="Grup", y="Penghindaran Makanan", color="Grup", box=True, points="outliers",
                    color_discrete_map={"Tanpa Jivara":"#EF5350","Dengan Jivara":"#1976D2"})
    fig.update_layout(**PL, height=420, title="RQ4: Distribusi Penghindaran Makanan",
                      showlegend=False, yaxis_tickformat='.0%',
                      xaxis=dict(tickfont=dict(size=14, color="#333")),
                      yaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555")))
    st.plotly_chart(fig, key="violin_avoid", width="stretch")

st.markdown("---")
st.success("**Kesimpulan:** Kedua pertanyaan penelitian menunjukkan perbedaan SIGNIFIKAN (p < 0.05). "
           "Jivara terbukti efektif meningkatkan kepatuhan obat dan penghindaran makanan berbahaya dalam simulasi.")
