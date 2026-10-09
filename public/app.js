:root {
  --bg: #070d18;
  --bg-soft: #0d1424;
  --panel: #101a2c;
  --panel-alt: #121f35;
  --line: #23324c;
  --line-soft: #2c4061;
  --blue: #4d8cff;
  --blue-strong: #2f6bff;
  --muted: #9cb0c9;
  --text: #eef4ff;
  --success: #42d392;
  --danger: #eb5b6f;
  --shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
  --radius: 18px;
  --container: 980px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(66, 117, 255, 0.2), transparent 35%), var(--bg);
  color: var(--text);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
button, input, textarea { font: inherit; }
button { cursor: pointer; }
button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid rgba(116, 175, 255, 0.8); outline-offset: 2px; }
a { color: #91bcff; text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; display: block; }

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 max(18px, calc((100% - var(--container)) / 2 + 18px));
  border-bottom: 1px solid var(--line);
  background: rgba(7, 13, 24, 0.86);
  backdrop-filter: blur(14px);
}
.brand {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.brand span { color: #7bb0ff; }
.container {
  max-width: var(--container);
  margin: 0 auto;
  padding: 28px 18px 110px;
}
.hero {
  background: linear-gradient(135deg, rgba(31, 54, 95, 0.9), rgba(15, 27, 42, 0.9) 72%);
  border: 1px solid var(--line-soft);
  border-radius: 24px;
  padding: 28px 22px;
  box-shadow: var(--shadow);
}
.eyebrow {
  display: inline-block;
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #a8c7ff;
  margin-bottom: 12px;
}
h1, h2, h3, h4, p { margin-top: 0; }
h1 { font-size: clamp(2rem, 4vw, 3rem); line-height: 1.08; margin-bottom: 12px; }
h2 { font-size: 1.2rem; margin-bottom: 14px; }
.muted { color: var(--muted); line-height: 1.7; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.stack { display: grid; gap: 16px; }
.panel, .link-card {
  background: rgba(16, 26, 44, 0.96);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
}
.link-card { display: grid; gap: 10px; }
.link-card .icon {
  width: 42px;
  height: 42px;
  display: inline-grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(92, 132, 255, 0.14);
  font-size: 1.2rem;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 18px 0 14px;
}
.section-head small { color: var(--muted); }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--blue), var(--blue-strong));
  color: white;
  font-weight: 700;
  padding: 10px 16px;
}
.btn:hover { filter: brightness(1.06); }
.btn-secondary {
  background: var(--panel-alt);
  border: 1px solid var(--line);
}
.btn-danger {
  background: rgba(235, 91, 111, 0.16);
  color: #ffb7c1;
  border: 1px solid rgba(235, 91, 111, 0.36);
}
.form-grid { display: grid; gap: 14px; }
label {
  display: grid;
  gap: 7px;
  color: #d4def5;
  font-size: 0.82rem;
}
input, textarea {
  width: 100%;
  border: 1px solid var(--line-soft);
  background: rgba(6, 14, 25, 0.8);
  color: var(--text);
  border-radius: 12px;
  padding: 12px 13px;
}
textarea { resize: vertical; min-height: 100px; }
.row { display: flex; align-items: center; gap: 14px; }
.row-between { justify-content: space-between; }
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #24477d, #1a304d);
  border: 1px solid var(--line-soft);
  object-fit: cover;
  display: grid;
  place-items: center;
  font-size: 1.55rem;
  color: var(--text);
  overflow: hidden;
}
.avatar.small { width: 42px; height: 42px; font-size: 1.1rem; }
.avatar.large { width: 86px; height: 86px; font-size: 2rem; }
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 0.73rem;
  font-weight: 700;
  background: rgba(66, 211, 146, 0.1);
  color: #7ff0bb;
  border: 1px solid rgba(66, 211, 146, 0.25);
}
.pill.offline {
  background: rgba(170, 181, 199, 0.1);
  color: #d5dff7;
  border-color: rgba(170, 181, 199, 0.16);
}
.list-people { display: grid; gap: 6px; }
.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}
.member-item:last-child { border-bottom: 0; }
.member-meta { min-width: 0; }
.member-meta strong { display: block; margin-bottom: 2px; font-size: 0.96rem; }
.member-meta small { color: var(--muted); }
.hidden { display: none !important; }
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 25;
  display: flex;
  justify-content: center;
  gap: 14px;
  padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
  background: rgba(8, 15, 24, 0.92);
  border-top: 1px solid var(--line);
  backdrop-filter: blur(14px);
}
.nav-item {
  flex: 1;
  max-width: 180px;
  min-height: 46px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--muted);
  font-weight: 700;
}
.nav-item.active {
  background: rgba(90, 134, 255, 0.12);
  color: #9ac0ff;
}
.notice-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 9, 18, 0.76);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 30;
}
.notice-card {
  position: relative;
  width: min(540px, 100%);
  background: rgba(16, 26, 44, 0.98);
  border: 1px solid var(--line-soft);
  border-radius: 22px;
  padding: 28px 22px 18px;
  box-shadow: var(--shadow);
}
.notice-card h2 { margin: 14px 0 8px; font-size: clamp(1.5rem, 3vw, 2rem); }
.notice-icon { font-size: 2.5rem; }
.notice-meta {
  color: #a8c7ff;
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--line-soft);
  background: rgba(30, 46, 70, 0.8);
  color: var(--text);
}
.toast {
  position: fixed;
  left: 50%;
  bottom: 88px;
  transform: translateX(-50%);
  background: rgba(20, 32, 50, 0.96);
  border: 1px solid var(--line-soft);
  color: var(--text);
  padding: 10px 16px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease;
  z-index: 40;
}
.toast.show { opacity: 1; }
@media (max-width: 560px) {
  .container { padding: 20px 14px 120px; }
  .section-head { flex-wrap: wrap; }
  .hero { padding: 22px 18px; }
  .member-item { align-items: flex-start; }
}
