import os

css_path = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\admin\src\styles\globals.css"

new_css = """
.sidebar-overlay { display: none; position: fixed; inset: 0; background-color: rgba(0,0,0,0.5); z-index: 40; }
.sidebar-overlay.open { display: block; }

.admin-sidebar { width: 260px; background-color: var(--color-bg-sidebar); color: var(--color-text-sidebar); display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 50; left: -260px; transition: left 0.3s ease; }
.admin-sidebar.open { left: 0; }

.admin-main { flex: 1; display: flex; flex-direction: column; width: 100%; }
.menu-toggle-btn, .menu-close-btn { display: block; background: none; border: none; color: var(--color-text-primary); cursor: pointer; }

@media (min-width: 768px) {
  .sidebar-overlay { display: none !important; }
  .admin-sidebar { position: relative; left: 0; }
  .menu-toggle-btn, .menu-close-btn { display: none !important; }
}

.table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
"""

with open(css_path, "a", encoding="utf-8") as f:
    f.write(new_css)

print("CSS appended successfully.")
