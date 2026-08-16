import os

base_dir = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\storefront\src"
checkout_path = os.path.join(base_dir, "components", "checkout", "CheckoutClient.js")
modal_path = os.path.join(base_dir, "components", "checkout", "OrderConfirmationModal.js")

# 1. Update CheckoutClient.js
with open(checkout_path, "r", encoding="utf-8") as f:
    checkout_content = f.read()

orig_checkout = """      // 3. Success
      setPlacedOrderId(order.id);
      await clearCart();"""

new_checkout = """      // 3. Success
      setPlacedOrderId(order.order_number);
      await clearCart();"""

checkout_content = checkout_content.replace(orig_checkout, new_checkout)

with open(checkout_path, "w", encoding="utf-8") as f:
    f.write(checkout_content)


# 2. Update OrderConfirmationModal.js
with open(modal_path, "r", encoding="utf-8") as f:
    modal_content = f.read()

orig_modal = "          {lang === 'ar' ? 'رقم طلبك هو: ' : 'Your Order ID is: '}"
new_modal = "          {lang === 'ar' ? 'رقم طلبك هو: ' : 'Your Order Number is: '}"

modal_content = modal_content.replace(orig_modal, new_modal)

with open(modal_path, "w", encoding="utf-8") as f:
    f.write(modal_content)

print("Order number changes applied successfully.")
