import streamlit as st, pandas as pd, plotly.express as px, re
from pathlib import Path
from collections import Counter

st.set_page_config(page_title="Nutrisi & Resep - Jivara", page_icon="🌿", layout="wide")
P = Path(__file__).resolve().parent.parent
PROC = P.parent / "data_output" / "processed"
ASSET = P / "asset"

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
.ingredient-tag{display:inline-block;background:#EDF7ED;color:#2E7D32;padding:5px 14px;border-radius:20px;font-size:0.82rem;font-weight:500;margin:3px;border:1px solid #D4E8D4}
hr{border-color:#E5E7EB!important}
</style>""", unsafe_allow_html=True)

logo = ASSET / "splash.png"
if logo.exists(): st.sidebar.image(str(logo), width=200)
st.sidebar.markdown("---")
st.sidebar.markdown("### Nutrisi & Resep Makanan")
st.sidebar.markdown("*Database Gizi & Resep Indonesia*")

COLORS = ["#2E7D32","#1976D2","#F57C00","#7B1FA2","#00897B","#D32F2F","#5C6BC0","#FFB300"]

# ── Shared Plotly layout with READABLE font sizes ──
PL = dict(
    paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
    font=dict(family="Plus Jakarta Sans", color="#333", size=14),
    margin=dict(l=20, r=20, t=50, b=20),
    title_font=dict(size=16, color="#2E7D32", family="Plus Jakarta Sans"),
)

# ── Load data ──
@st.cache_data
def load_nutrisi():
    return pd.read_csv(PROC / "unified_nutrition.csv")

@st.cache_data
def load_resep():
    return pd.read_csv(PROC / "61_kelas_resep_cleaned.csv")

@st.cache_data
def extract_all_ingredients(df):
    all_ingredients = []
    for bahan_str in df['Bahan-bahan'].dropna():
        for item in [b.strip() for b in bahan_str.split('|')]:
            cleaned = re.sub(r'^\d+[\s/\d]*\s*(sdm|sdt|buah|siung|batang|lembar|porsi|bungkus|butir|ekor|biji|iris|potong|helai|cm|kg|gr|gram|ml|liter|sendok|mangkok|gelas|sachet|bks|bh)\s*', '', item, flags=re.IGNORECASE)
            cleaned = re.sub(r'^secukupnya\s*', '', cleaned, flags=re.IGNORECASE).strip().lower()
            if len(cleaned) > 1: all_ingredients.append(cleaned)
    return Counter(all_ingredients)

df_nutrisi = load_nutrisi()
df_resep = load_resep()
ingredient_counts = extract_all_ingredients(df_resep)

# ── Header ──
st.markdown('<div class="page-header"><h2>Analisis Nutrisi & Resep Makanan Indonesia</h2><p>Eksplorasi 1.476 data nutrisi dan 1.050 resep dari berbagai sumber data Indonesia & Global</p></div>', unsafe_allow_html=True)

# ── KPI Metrics ──
c1, c2, c3, c4, c5, c6 = st.columns(6)
c1.metric("Total Makanan", f"{len(df_nutrisi):,}")
c2.metric("Rata-rata Kalori", f"{df_nutrisi['calories'].mean():.0f} Kcal")
c3.metric("Sumber Data", f"{df_nutrisi['source'].nunique()} Sumber")
c4.metric("Total Resep", f"{len(df_resep):,}")
c5.metric("Kelas Makanan", f"{df_resep['Kelas_YOLO'].nunique()}")
c6.metric("Bahan Unik", f"{len(ingredient_counts):,}")

st.markdown("---")

# ══════════════════════════════════════════════════════════
# BAGIAN 1: NUTRISI
# ══════════════════════════════════════════════════════════

tab_nutrisi, tab_resep = st.tabs(["🥗 **Analisis Nutrisi**", "🍳 **Database Resep**"])

with tab_nutrisi:
    col1, col2 = st.columns(2, gap="medium")
    with col1:
        st.markdown('<div class="section-title">Kategori Makronutrien</div>', unsafe_allow_html=True)
        mc = df_nutrisi['macro_category'].value_counts().reset_index()
        mc.columns = ['Kategori','Jumlah']
        fig = px.pie(mc, names='Kategori', values='Jumlah', color_discrete_sequence=COLORS, hole=0.45)
        fig.update_traces(textposition='inside', textinfo='percent+label', textfont_size=13)
        fig.update_layout(**PL, height=400, showlegend=False)
        st.plotly_chart(fig, key="pie_macro", width="stretch")

    with col2:
        st.markdown('<div class="section-title">Sumber Data Nutrisi</div>', unsafe_allow_html=True)
        sc = df_nutrisi['source'].value_counts().reset_index()
        sc.columns = ['Sumber','Jumlah']
        sc['Sumber'] = sc['Sumber'].map({
            'nutrition1_indonesia':'TKPI Indonesia',
            'food101_global':'Food-101 Global',
            'manual_curated_tkpi':'Manual Curated'
        }).fillna(sc['Sumber'])
        fig = px.bar(sc, x='Sumber', y='Jumlah', color='Sumber',
                     color_discrete_sequence=['#1976D2','#F57C00','#2E7D32'], text='Jumlah')
        fig.update_traces(textposition='outside', textfont_size=14, textfont_color="#333")
        fig.update_layout(**PL, height=400, showlegend=False,
                          xaxis=dict(showgrid=False, tickfont=dict(size=13, color="#333")),
                          yaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555")))
        st.plotly_chart(fig, key="bar_sumber", width="stretch")

    st.markdown("---")

    st.markdown('<div class="section-title">Top 15 Makanan Berkalori Tertinggi</div>', unsafe_allow_html=True)
    top = df_nutrisi.nlargest(15, 'calories')[['food_name','calories','proteins','fat','carbohydrate']].reset_index(drop=True)
    fig = px.bar(top, x='calories', y='food_name', orientation='h', color='calories',
                 color_continuous_scale=[[0,'#BBDEFB'],[0.4,'#F57C00'],[1,'#D32F2F']], text='calories')
    fig.update_traces(texttemplate='%{text:.0f} Kcal', textposition='outside', textfont_size=12, textfont_color="#333")
    fig.update_layout(**PL, height=520,
                      yaxis=dict(autorange='reversed', showgrid=False, tickfont=dict(size=13, color="#333")),
                      xaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555"),
                                 title=dict(text="Kalori (Kcal)", font=dict(size=13, color="#555"))),
                      coloraxis_showscale=False)
    st.plotly_chart(fig, key="bar_top15", width="stretch")

    st.markdown("---")

    st.markdown('<div class="section-title">Distribusi Nutrisi</div>', unsafe_allow_html=True)
    nutrient = st.selectbox("Pilih nutrisi untuk dilihat distribusinya:",
                            ['calories','proteins','fat','carbohydrate','sodium'],
                            format_func=lambda x: {'calories':'Kalori (Kcal)','proteins':'Protein (g)',
                                                    'fat':'Lemak (g)','carbohydrate':'Karbohidrat (g)',
                                                    'sodium':'Natrium (mg)'}.get(x, x), key="sel_nutrient")
    label_map = {'calories':'Kalori (Kcal)','proteins':'Protein (g)','fat':'Lemak (g)',
                 'carbohydrate':'Karbohidrat (g)','sodium':'Natrium (mg)'}
    fig = px.histogram(df_nutrisi.dropna(subset=[nutrient]), x=nutrient, nbins=50, color_discrete_sequence=['#1976D2'])
    fig.update_traces(marker_line_color='#0D47A1', marker_line_width=0.5)
    fig.update_layout(**PL, height=370,
                      xaxis=dict(showgrid=False, tickfont=dict(size=12, color="#555"),
                                 title=dict(text=label_map.get(nutrient, nutrient), font=dict(size=13, color="#555"))),
                      yaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555"),
                                 title=dict(text="Jumlah Makanan", font=dict(size=13, color="#555"))))
    st.plotly_chart(fig, key="hist_nutrisi", width="stretch")

    st.markdown("---")

    st.markdown('<div class="section-title">Korelasi Makronutrien</div>', unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    x_ax = c1.selectbox("Sumbu X:", ['calories','proteins','fat','carbohydrate'], index=0, key="corr_x")
    y_ax = c2.selectbox("Sumbu Y:", ['calories','proteins','fat','carbohydrate'], index=1, key="corr_y")
    fig = px.scatter(df_nutrisi, x=x_ax, y=y_ax, color='macro_category', hover_data=['food_name'],
                     color_discrete_sequence=COLORS, opacity=0.7)
    fig.update_layout(**PL, height=440,
                      xaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555"),
                                 title=dict(text=label_map.get(x_ax, x_ax), font=dict(size=13, color="#555"))),
                      yaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555"),
                                 title=dict(text=label_map.get(y_ax, y_ax), font=dict(size=13, color="#555"))),
                      legend=dict(font=dict(size=12, color="#333")))
    st.plotly_chart(fig, key="scatter_corr", width="stretch")

    st.markdown("---")

    st.markdown('<div class="section-title">Pencarian Makanan</div>', unsafe_allow_html=True)
    q = st.text_input("Ketik nama makanan:", "", placeholder="Contoh: rendang, nasi goreng, gudeg...", key="search_food")
    if q:
        res = df_nutrisi[df_nutrisi['food_name'].str.contains(q, case=False, na=False)]
        if len(res) > 0:
            st.success(f"Ditemukan **{len(res)}** makanan")
            st.dataframe(res[['food_name','calories','proteins','fat','carbohydrate','macro_category','source']]
                .rename(columns={'food_name':'Makanan','calories':'Kalori','proteins':'Protein',
                                 'fat':'Lemak','carbohydrate':'Karbo','macro_category':'Kategori','source':'Sumber'})
                .reset_index(drop=True), width="stretch", height=400)
        else:
            st.warning("Tidak ditemukan makanan dengan kata kunci tersebut.")


# ══════════════════════════════════════════════════════════
# BAGIAN 2: RESEP
# ══════════════════════════════════════════════════════════

with tab_resep:
    c1, c2, c3 = st.columns(3)
    c1.metric("Rata-rata Bahan", f"{df_resep['Jumlah_Bahan'].mean():.1f}")
    c2.metric("Rata-rata Langkah", f"{df_resep['Jumlah_Langkah'].mean():.1f}")
    c3.metric("Maks Protein", f"{df_nutrisi['proteins'].max():.0f}g")

    st.markdown("---")

    col1, col2 = st.columns(2, gap="medium")
    with col1:
        st.markdown('<div class="section-title">Tingkat Kompleksitas Resep</div>', unsafe_allow_html=True)
        kc = df_resep['Kompleksitas'].value_counts().reset_index(); kc.columns = ['Kompleksitas','Jumlah']
        fig = px.pie(kc, names='Kompleksitas', values='Jumlah', hole=0.45,
                     color='Kompleksitas', color_discrete_map={'Sederhana':'#1976D2','Menengah':'#F57C00','Kompleks':'#D32F2F'})
        fig.update_traces(textposition='inside', textinfo='percent+label', textfont_size=14)
        fig.update_layout(**PL, height=400, showlegend=False)
        st.plotly_chart(fig, key="pie_kompleks", width="stretch")

    with col2:
        st.markdown('<div class="section-title">Jumlah Resep per Kelas (Top 15)</div>', unsafe_allow_html=True)
        rc = df_resep['Kelas_YOLO'].value_counts().head(15).reset_index(); rc.columns = ['Kelas','Jumlah']
        rc['Kelas'] = rc['Kelas'].str.replace('-',' ').str.title()
        fig = px.bar(rc, x='Jumlah', y='Kelas', orientation='h', color='Jumlah',
                     color_continuous_scale=[[0,'#FFE0B2'],[0.4,'#F57C00'],[1,'#E65100']], text='Jumlah')
        fig.update_traces(textposition='outside', textfont_size=12, textfont_color="#333")
        fig.update_layout(**PL, height=440,
                          yaxis=dict(autorange='reversed', showgrid=False, tickfont=dict(size=13, color="#333")),
                          xaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555"),
                                     title=dict(text="Jumlah Resep", font=dict(size=13, color="#555"))),
                          coloraxis_showscale=False)
        st.plotly_chart(fig, key="bar_kelas", width="stretch")

    st.markdown("---")
    st.markdown('<div class="section-title">Bahan Paling Sering Digunakan (Top 25)</div>', unsafe_allow_html=True)
    ing_df = pd.DataFrame(ingredient_counts.most_common(25), columns=['Bahan','Frekuensi'])
    fig = px.bar(ing_df, x='Frekuensi', y='Bahan', orientation='h', color='Frekuensi',
                 color_continuous_scale=[[0,'#BBDEFB'],[0.4,'#1976D2'],[1,'#0D47A1']], text='Frekuensi')
    fig.update_traces(textposition='outside', textfont_size=12, textfont_color="#333")
    fig.update_layout(**PL, height=680,
                      yaxis=dict(autorange='reversed', showgrid=False, tickfont=dict(size=13, color="#333")),
                      xaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555"),
                                 title=dict(text="Frekuensi Penggunaan", font=dict(size=13, color="#555"))),
                      coloraxis_showscale=False)
    st.plotly_chart(fig, key="bar_bahan", width="stretch")

    st.markdown("---")
    st.markdown('<div class="section-title">Distribusi Jumlah Bahan & Langkah</div>', unsafe_allow_html=True)
    col1, col2 = st.columns(2, gap="medium")
    with col1:
        fig = px.histogram(df_resep, x='Jumlah_Bahan', nbins=30, color_discrete_sequence=['#F57C00'])
        fig.update_traces(marker_line_color='#E65100', marker_line_width=0.5)
        fig.update_layout(**PL, height=370, title="Jumlah Bahan per Resep",
                          xaxis=dict(showgrid=False, title=dict(text="Jumlah Bahan", font=dict(size=13, color="#555")),
                                     tickfont=dict(size=12, color="#555")),
                          yaxis=dict(showgrid=True, gridcolor="#EAEAEA", title=dict(text="Jumlah Resep", font=dict(size=13, color="#555")),
                                     tickfont=dict(size=12, color="#555")))
        st.plotly_chart(fig, key="hist_bahan", width="stretch")
    with col2:
        fig = px.histogram(df_resep, x='Jumlah_Langkah', nbins=20, color_discrete_sequence=['#7B1FA2'])
        fig.update_traces(marker_line_color='#4A148C', marker_line_width=0.5)
        fig.update_layout(**PL, height=370, title="Jumlah Langkah per Resep",
                          xaxis=dict(showgrid=False, title=dict(text="Jumlah Langkah", font=dict(size=13, color="#555")),
                                     tickfont=dict(size=12, color="#555")),
                          yaxis=dict(showgrid=True, gridcolor="#EAEAEA", title=dict(text="Jumlah Resep", font=dict(size=13, color="#555")),
                                     tickfont=dict(size=12, color="#555")))
        st.plotly_chart(fig, key="hist_langkah", width="stretch")

    st.markdown("---")
    st.markdown('<div class="section-title">Bahan vs Kompleksitas</div>', unsafe_allow_html=True)
    fig = px.box(df_resep, x='Kompleksitas', y='Jumlah_Bahan', color='Kompleksitas',
                 color_discrete_map={'Sederhana':'#1976D2','Menengah':'#F57C00','Kompleks':'#D32F2F'},
                 category_orders={'Kompleksitas':['Sederhana','Menengah','Kompleks']})
    fig.update_layout(**PL, height=400, showlegend=False,
                      xaxis=dict(showgrid=False, tickfont=dict(size=14, color="#333")),
                      yaxis=dict(showgrid=True, gridcolor="#EAEAEA", tickfont=dict(size=12, color="#555"),
                                 title=dict(text="Jumlah Bahan", font=dict(size=13, color="#555"))))
    st.plotly_chart(fig, key="box_komplex", width="stretch")

    st.markdown("---")
    st.markdown('<div class="section-title">Eksplorasi Resep per Kelas Makanan</div>', unsafe_allow_html=True)
    sel_kelas = st.selectbox("Pilih kelas makanan:", sorted(df_resep['Kelas_YOLO'].unique()),
                             format_func=lambda x: x.replace('-',' ').title(), key="sel_kelas")
    filtered = df_resep[df_resep['Kelas_YOLO'] == sel_kelas].reset_index(drop=True)
    st.caption(f"Menampilkan **{len(filtered)}** resep untuk **{sel_kelas.replace('-',' ').title()}**")

    kelas_ing = Counter()
    for bahan_str in filtered['Bahan-bahan'].dropna():
        for item in [b.strip() for b in bahan_str.split('|')]:
            cleaned = re.sub(r'^\d+[\s/\d]*\s*(sdm|sdt|buah|siung|batang|lembar|porsi|bungkus|butir|ekor|biji|iris|potong|helai|cm|kg|gr|gram|ml|liter|sendok|mangkok|gelas|sachet|bks|bh)\s*', '', item, flags=re.IGNORECASE)
            cleaned = re.sub(r'^secukupnya\s*', '', cleaned, flags=re.IGNORECASE).strip().lower()
            if len(cleaned) > 1: kelas_ing[cleaned] += 1

    if kelas_ing:
        st.markdown("**Bahan paling umum dalam kelas ini:**")
        st.markdown(' '.join(f'<span class="ingredient-tag">{ing} ({cnt})</span>' for ing, cnt in kelas_ing.most_common(20)), unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True)

    for i, row in filtered.iterrows():
        with st.expander(f"{row['Nama Resep']}  —  {row.get('Kompleksitas','')} | {int(row['Jumlah_Bahan'])} bahan | {int(row['Jumlah_Langkah'])} langkah"):
            c1, c2 = st.columns(2)
            with c1:
                st.markdown("**Bahan-bahan:**")
                for b in [b.strip() for b in str(row['Bahan-bahan']).split('|')]: st.markdown(f"- {b}")
            with c2:
                st.markdown("**Langkah Memasak:**")
                for j, l in enumerate([l.strip() for l in str(row['Langkah Memasak']).split('||')], 1): st.markdown(f"**{j}.** {l}")
            if pd.notna(row.get('URL')): st.markdown(f"[Lihat resep asli di Cookpad]({row['URL']})")
