import os

base_dir = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\storefront\src"

# 1. ProductInfo.js
pinfo_path = os.path.join(base_dir, "components", "product", "ProductInfo.js")
with open(pinfo_path, "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace(
    '<div className="product-price-large">',
    '<div className="product-price-large" style={{ direction: \'ltr\', unicodeBidi: \'isolate\', display: \'inline-flex\', gap: \'8px\', alignItems: \'baseline\' }}>'
)
with open(pinfo_path, "w", encoding="utf-8") as f:
    f.write(content)

# 2. ProductCard.js
pcard_path = os.path.join(base_dir, "components", "shop", "ProductCard.js")
with open(pcard_path, "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace(
    '<div className="product-price">',
    '<div className="product-price" style={{ direction: \'ltr\', unicodeBidi: \'isolate\' }}>'
)
with open(pcard_path, "w", encoding="utf-8") as f:
    f.write(content)

# 3. components.css
css_path = os.path.join(base_dir, "styles", "components.css")
with open(css_path, "r", encoding="utf-8") as f:
    content = f.read()

# Update .product-grid
content = content.replace(
    '.product-grid {\n  display: grid;',
    '.product-grid {\n  display: grid;\n  justify-content: center;'
)

# Update product image container
content = content.replace(
    '  padding-top: 100%;\n  background: var(--color-bg-tertiary);\n  overflow: hidden;\n}',
    '  aspect-ratio: 1 / 1;\n  background: var(--color-bg-secondary);\n  padding: var(--space-4);\n  overflow: hidden;\n}'
)

content = content.replace(
    '  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;',
    '  top: var(--space-4);\n  left: var(--space-4);\n  width: calc(100% - calc(var(--space-4) * 2));\n  height: calc(100% - calc(var(--space-4) * 2));\n  object-fit: contain;'
)

# Update text color
content = content.replace(
    '.product-details {\n  padding: var(--space-4);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n}',
    '.product-details {\n  padding: var(--space-4);\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  color: var(--color-text-primary);\n}'
)

# Add button styles
btn_style = """
.product-card button {
  background: transparent !important;
  border: 1px solid var(--color-accent) !important;
  color: var(--color-accent) !important;
  transition: all var(--transition-fast);
}
.product-card button:hover:not(:disabled) {
  background: var(--color-accent) !important;
  color: #000 !important;
}
"""

if '.product-card button' not in content:
    content += "\n" + btn_style

with open(css_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updates applied successfully.")
