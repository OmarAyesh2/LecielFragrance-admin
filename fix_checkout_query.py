import os

base_dir = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\storefront\src"
checkout_path = os.path.join(base_dir, "app", "checkout", "page.js")

with open(checkout_path, "r", encoding="utf-8") as f:
    content = f.read()

orig_query = ".order('name_en', { ascending: true })"
new_query = ".order('governorate_en', { ascending: true })"

content = content.replace(orig_query, new_query)

with open(checkout_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Checkout page.js query updated successfully.")
