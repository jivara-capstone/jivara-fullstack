import streamlit as st, pandas as pd, plotly.express as px
from pathlib import Path

st.set_page_config(page_title="Obat BPOM - Jivara", page_icon="🌿", layout="wide")
P = Path(__file__).resolve().parent.parent
PROC = P.parent / "data_output" / "processed"
ASSET = P / "asset"

st.markdown("""
<style>
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
[data-testid="stMain"] h1{color:#1A1A1A!important}
[data-testid="stMain"] h2{color:#222!important}
[data-testid="stMain"] h3,[data-testid="stMain"] h4{color:#2A2A2A!important}
[data-testid="stMain"] strong{color:#222!important}
button{color:#333!important}
[data-testid="stSidebar"] button{color:#FFF!important}
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
hr{border-color:#E5E7EB!important}
</style>
""", unsafe_allow_html=True)

logo = ASSET / "splash.png"
if logo.exists(): st.sidebar.image(str(logo), width=200)
st.sidebar.markdown("---")
st.sidebar.markdown("### Database Obat BPOM")
st.sidebar.markdown("*Registrasi Obat Indonesia*")

COLORS = ["#1976D2","#F57C00","#2E7D32","#7B1FA2","#00897B","#D32F2F","#5C6BC0","#FFB300"]
PL = dict(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
          font=dict(family="Plus Jakarta Sans", color="#333", size=14), margin=dict(l=20,r=20,t=50,b=20),
          title_font=dict(size=16, color="#2E7D32", family="Plus Jakarta Sans"))

@st.cache_data
def load():
    return pd.read_csv(PROC / "obat_bpom_cleaned_dedup.csv")
df = load()

st.markdown('<div class="page-header"><h2>Database Obat BPOM Indonesia</h2><p>Analisis komprehensif 15.085 produk obat terdaftar di BPOM RI</p></div>', unsafe_allow_html=True)

c1, c2, c3, c4 = st.columns(4)
c1.metric("Total Produk", f"{len(df):,}")
c2.metric("Obat Keras", f"{(df['Golongan_Obat']=='Obat Keras').sum():,}")
c3.metric("Produk Lokal", f"{(df['Asal_Obat']=='Lokal/Lainnya').sum():,}")
c4.metric("Produk Impor", f"{(df['Asal_Obat']=='Impor').sum():,}")

st.markdown("---")

col1, col2 = st.columns(2, gap="medium")
with col1:
    st.markdown('<div class="section-title">Golongan Obat</div>', unsafe_allow_html=True)
    gc = df['Golongan_Obat'].value_counts().reset_index()
    gc.columns = ['Golongan','Jumlah']
    fig = px.pie(gc, names='Golongan', values='Jumlah', color_discrete_sequence=COLORS, hole=0.45)
    fig.update_traces(textposition='inside', textinfo='percent+label', textfont_size=13)
    fig.update_layout(**PL, height=400, showlegend=False)
    st.plotly_chart(fig, key="pie_golongan", width="stretch")

with col2:
    st.markdown('<div class="section-title">Bentuk Sediaan (Top 10)</div>', unsafe_allow_html=True)
    bs = df['Bentuk Sediaan'].value_counts().head(10).reset_index()
    bs.columns = ['Bentuk','Jumlah']
    fig = px.bar(bs, x='Jumlah', y='Bentuk', orientation='h', color='Jumlah',
                 color_continuous_scale=[[0,'#BBDEFB'],[0.4,'#1976D2'],[1,'#0D47A1']], text='Jumlah')
    fig.update_traces(textposition='outside', textfont_size=12, textfont_color="#333")
    fig.update_layout(**PL, height=400,
                      yaxis=dict(autorange='reversed', showgrid=False, tickfont=dict(size=13, color="#333")),
                      xaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555")),
                      coloraxis_showscale=False)
    st.plotly_chart(fig, key="bar_bentuk", width="stretch")

st.markdown("---")

col1, col2 = st.columns(2, gap="medium")
with col1:
    st.markdown('<div class="section-title">Asal Obat</div>', unsafe_allow_html=True)
    ao = df['Asal_Obat'].value_counts().reset_index()
    ao.columns = ['Asal','Jumlah']
    fig = px.bar(ao, x='Asal', y='Jumlah', color='Asal',
                 color_discrete_sequence=['#1976D2','#F57C00'], text='Jumlah')
    fig.update_traces(textposition='outside', textfont_size=14, textfont_color="#333")
    fig.update_layout(**PL, height=370, showlegend=False,
                      xaxis=dict(showgrid=False, tickfont=dict(size=13, color="#333")),
                      yaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555")))
    st.plotly_chart(fig, key="bar_asal", width="stretch")

with col2:
    st.markdown('<div class="section-title">Kategori Obat (Top 8)</div>', unsafe_allow_html=True)
    ko = df['Kategori_Obat'].value_counts().head(8).reset_index()
    ko.columns = ['Kategori','Jumlah']
    fig = px.bar(ko, x='Jumlah', y='Kategori', orientation='h', color_discrete_sequence=['#00897B'], text='Jumlah')
    fig.update_traces(textposition='outside', textfont_size=12, textfont_color="#333")
    fig.update_layout(**PL, height=370,
                      yaxis=dict(autorange='reversed', showgrid=False, tickfont=dict(size=13, color="#333")),
                      xaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555")))
    st.plotly_chart(fig, key="bar_kategori", width="stretch")

st.markdown("---")

st.markdown('<div class="section-title">Cari Produk Obat</div>', unsafe_allow_html=True)
q = st.text_input("Ketik nama produk obat:", "", placeholder="Contoh: paracetamol, amoxicillin...")
if q:
    r = df[df['Nama Produk'].str.contains(q, case=False, na=False)]
    if len(r) > 0:
        st.success(f"Ditemukan **{len(r)}** produk")
        st.dataframe(r[['Nama Produk','Komposisi','Bentuk Sediaan','Golongan_Obat','Perusahaan']].head(50)
            .reset_index(drop=True), width="stretch", height=400)
    else:
        st.warning("Tidak ditemukan produk dengan kata kunci tersebut.")
