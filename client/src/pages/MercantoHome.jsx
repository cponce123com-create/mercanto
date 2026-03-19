import { useState } from "react";

const categories = [
  { icon: "🍔", label: "Restaurantes" },
  { icon: "🍎", label: "Fruterías" },
  { icon: "🏪", label: "Minimarkets" },
  { icon: "👕", label: "Ropa" },
  { icon: "🧴", label: "Hogar" },
  { icon: "💊", label: "Farmacias" },
  { icon: "♻️", label: "Segunda Mano" },
];

const stores = [
  {
    name: "Sabor Local",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
  {
    name: "Fresh Fruteria",
    img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80",
  },
  {
    name: "Moda Express",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  },
  {
    name: "Market San Jose",
    img: "https://images.unsplash.com/photo-1604719312566-8912e9667d9f?w=400&q=80",
  },
];

const offers = [
  {
    label: "2x1\nSush Roll",
    img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80",
    badge: "2x1",
    badgeColor: "#1a1a1a",
  },
  {
    label: "-30%",
    img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
    badge: "-30%",
    badgeColor: "#2e7d32",
  },
  {
    label: "Liquidación\nde Ropa",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    badge: "-50%",
    badgeColor: "#c62828",
  },
];

const navLinks = ["Inicio", "Categorías", "Tiendas", "Restaurantes", "Ofertas", "Mis Pedidos"];

export default function MercantoHome() {
  const [activeNav, setActiveNav] = useState("Inicio");
  const [district] = useState("Mi Distrito");

  return (
    <div style={styles.root}>
      {/* TOP RED BAR */}
      <div style={styles.topBar} />

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          {/* Logo */}
          <span style={styles.logo}>mercanto</span>

          {/* Links */}
          <div style={styles.navLinks}>
            {navLinks.map((l) => (
              <button
                key={l}
                onClick={() => setActiveNav(l)}
                style={{
                  ...styles.navLink,
                  ...(activeNav === l ? styles.navLinkActive : {}),
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Right icons */}
          <div style={styles.navRight}>
            <button style={styles.districtBtn}>
              <span style={styles.pinIcon}>📍</span>
              <span>{district}</span>
            </button>
            <button style={styles.iconBtn}>🔔</button>
            <button style={styles.avatarBtn}>👤</button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={styles.main}>

        {/* ── HERO BANNER ── */}
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <p style={styles.heroSub}>Todo en un solo lugar</p>
            <h1 style={styles.heroTitle}>¡Compra en tu distrito!</h1>
            <p style={styles.heroDelivery}>Delivery rápido y seguro</p>
            <button style={styles.heroCta}>¡Pide Ahora!</button>
          </div>
          <div style={styles.heroIllustration}>
            <img
              src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&q=80"
              alt="delivery"
              style={styles.heroImg}
            />
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section style={styles.section}>
          <div style={styles.categoriesRow}>
            {categories.map((c) => (
              <button key={c.label} style={styles.catItem}>
                <div style={styles.catIcon}>{c.icon}</div>
                <span style={styles.catLabel}>{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── STORES SECTION ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Compra en tu distrito</h2>

          {/* Filters */}
          <div style={styles.filters}>
            <button style={styles.filterBtnActive}>
              <span>📍</span> Cerca de ti ▾
            </button>
            <span style={styles.filterDivider} />
            <button style={styles.filterBtn}>Por Categoría</button>
            <span style={styles.filterDivider}>|</span>
            <button style={styles.filterBtn}>Menor Precio</button>
          </div>

          {/* Store grid */}
          <div style={styles.storeGrid}>
            {stores.map((s) => (
              <div key={s.name} style={styles.storeCard}>
                <img src={s.img} alt={s.name} style={styles.storeImg} />
                <div style={styles.storeOverlay}>
                  <span style={styles.storeName}>{s.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TACORA BANNER ── */}
        <section style={styles.section}>
          <div style={styles.tacoraBanner}>
            <div style={styles.tacoraCard}>
              <div style={styles.tacoraTag}>Tacora</div>
              <h3 style={styles.tacoraTitle}>Segunda Mano</h3>
              <p style={styles.tacoraDesc}>
                Encuentra ofertas de segunda mano cerca de ti.
              </p>
              <button style={styles.tacoraBtn}>Explorar Productos</button>
            </div>
          </div>
        </section>

        {/* ── SPECIAL OFFERS ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Ofertas Especiales</h2>
          <div style={styles.offersGrid}>
            {offers.map((o) => (
              <div key={o.label} style={styles.offerCard}>
                <img src={o.img} alt={o.label} style={styles.offerImg} />
                <div style={styles.offerOverlay}>
                  <span
                    style={{
                      ...styles.offerBadge,
                      background: o.badgeColor,
                    }}
                  >
                    {o.badge}
                  </span>
                  <span style={styles.offerLabel}>
                    {o.label.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={styles.footer}>
          <span style={styles.footerLogo}>mercanto</span>
          <p style={styles.footerText}>© 2026 Mercanto. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const RED = "#e53935";
const DARK_RED = "#c62828";
const WHITE = "#ffffff";
const LIGHT_BG = "#f5f5f5";
const TEXT_DARK = "#1a1a1a";
const TEXT_GRAY = "#555";
const TACORA_GREEN = "#2e5a1c";

const styles = {
  root: {
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    background: WHITE,
    minHeight: "100vh",
    color: TEXT_DARK,
  },
  topBar: {
    height: 5,
    background: RED,
    width: "100%",
  },

  // NAV
  nav: {
    background: WHITE,
    borderBottom: "1px solid #eee",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  navInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: "0 20px",
    height: 60,
  },
  logo: {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 900,
    fontSize: 26,
    color: RED,
    letterSpacing: "-0.5px",
    marginRight: 12,
    flexShrink: 0,
  },
  navLinks: {
    display: "flex",
    gap: 4,
    flex: 1,
  },
  navLink: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: TEXT_DARK,
    padding: "6px 10px",
    borderRadius: 6,
    textDecoration: "none",
    transition: "color 0.2s",
  },
  navLinkActive: {
    color: RED,
    textDecoration: "underline",
    textUnderlineOffset: 4,
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  districtBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "1.5px solid #ddd",
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    color: TEXT_DARK,
  },
  pinIcon: { fontSize: 14 },
  iconBtn: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
  },
  avatarBtn: {
    background: "#eee",
    border: "none",
    borderRadius: "50%",
    width: 36,
    height: 36,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // HERO
  hero: {
    maxWidth: 1100,
    margin: "24px auto",
    padding: "0 20px",
    background: "#fff8f8",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    minHeight: 200,
    border: "1px solid #fce4e4",
  },
  heroContent: {
    padding: "32px 40px",
    flex: 1,
  },
  heroSub: {
    fontSize: 18,
    fontWeight: 600,
    color: TEXT_DARK,
    margin: "0 0 4px",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 900,
    color: RED,
    margin: "0 0 8px",
    lineHeight: 1.2,
  },
  heroDelivery: {
    fontSize: 15,
    color: TEXT_GRAY,
    margin: "0 0 20px",
  },
  heroCta: {
    background: RED,
    color: WHITE,
    border: "none",
    borderRadius: 8,
    padding: "12px 28px",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  heroIllustration: {
    width: 320,
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: "0 16px 16px 0",
  },
  heroImg: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    display: "block",
  },

  // MAIN
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 20px 40px",
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: TEXT_DARK,
    marginBottom: 16,
  },

  // CATEGORIES
  categoriesRow: {
    display: "flex",
    gap: 16,
    background: WHITE,
    borderRadius: 14,
    padding: "20px 24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    overflowX: "auto",
  },
  catItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    background: "none",
    border: "none",
    cursor: "pointer",
    minWidth: 72,
    padding: "8px 4px",
    borderRadius: 10,
    transition: "background 0.15s",
  },
  catIcon: {
    fontSize: 36,
    lineHeight: 1,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: TEXT_DARK,
    textAlign: "center",
  },

  // FILTERS
  filters: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  filterBtnActive: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#e8f5e9",
    border: "1.5px solid #4caf50",
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    color: "#2e7d32",
  },
  filterBtn: {
    background: "none",
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    color: TEXT_GRAY,
    cursor: "pointer",
    padding: "6px 4px",
  },
  filterDivider: {
    color: "#ccc",
    fontSize: 16,
  },

  // STORE GRID
  storeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
  },
  storeCard: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    aspectRatio: "1 / 1",
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  storeImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s",
  },
  storeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.65))",
    padding: "24px 12px 12px",
  },
  storeName: {
    color: WHITE,
    fontWeight: 800,
    fontSize: 15,
  },

  // TACORA
  tacoraBanner: {
    background: "#f1f8e9",
    borderRadius: 14,
    padding: "4px",
    border: "1px dashed #8bc34a",
  },
  tacoraCard: {
    background: TACORA_GREEN,
    borderRadius: 12,
    padding: "28px 32px",
    display: "inline-block",
    maxWidth: 300,
  },
  tacoraTag: {
    display: "inline-block",
    background: "#8bc34a",
    color: WHITE,
    fontWeight: 900,
    fontSize: 20,
    fontStyle: "italic",
    padding: "2px 14px",
    borderRadius: 6,
    marginBottom: 10,
    letterSpacing: "0.5px",
  },
  tacoraTitle: {
    color: WHITE,
    fontWeight: 800,
    fontSize: 18,
    margin: "0 0 8px",
  },
  tacoraDesc: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    margin: "0 0 18px",
    lineHeight: 1.5,
  },
  tacoraBtn: {
    background: RED,
    color: WHITE,
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },

  // OFFERS
  offersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  offerCard: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    aspectRatio: "4 / 3",
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  offerImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  offerOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, transparent 60%)",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  offerBadge: {
    display: "inline-block",
    color: WHITE,
    fontWeight: 900,
    fontSize: 22,
    padding: "4px 10px",
    borderRadius: 8,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  offerLabel: {
    color: WHITE,
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1.4,
    textShadow: "0 1px 4px rgba(0,0,0,0.6)",
  },

  // FOOTER
  footer: {
    borderTop: "1px solid #eee",
    marginTop: 24,
    paddingTop: 24,
    textAlign: "center",
  },
  footerLogo: {
    fontWeight: 900,
    fontSize: 22,
    color: RED,
  },
  footerText: {
    color: TEXT_GRAY,
    fontSize: 13,
    marginTop: 6,
  },
};
