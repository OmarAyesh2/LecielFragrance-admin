import os

base_dir = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\storefront\src"
checkout_path = os.path.join(base_dir, "components", "checkout", "CheckoutClient.js")

with open(checkout_path, "r", encoding="utf-8") as f:
    content = f.read()

orig_unmount = "  if (!isClient || cartItems.length === 0) return null;"
new_unmount = "  if (!isClient || (cartItems.length === 0 && !placedOrderId)) return null;"

orig_success = """      // 3. Success
      clearCart();
      setPlacedOrderId(order.id);"""

new_success = """      // 3. Success
      setPlacedOrderId(order.id);
      await clearCart();"""

content = content.replace(orig_unmount, new_unmount)
content = content.replace(orig_success, new_success)

with open(checkout_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Checkout unmount bug fixed successfully.")
