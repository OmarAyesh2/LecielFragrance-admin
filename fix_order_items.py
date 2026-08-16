import os

base_dir = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\storefront\src"
checkout_path = os.path.join(base_dir, "components", "checkout", "CheckoutClient.js")

with open(checkout_path, "r", encoding="utf-8") as f:
    content = f.read()

orig_items = """      // 2. Insert Order Items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        price: item.price
      }));"""

new_items = """      // 2. Insert Order Items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity,
        product_name_en: item.name_en,
        product_name_ar: item.name_ar
      }));"""

content = content.replace(orig_items, new_items)

with open(checkout_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Checkout order items payload updated successfully.")
