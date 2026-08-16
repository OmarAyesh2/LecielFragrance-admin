import os

base_dir = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\storefront\src"
checkout_path = os.path.join(base_dir, "components", "checkout", "CheckoutClient.js")

with open(checkout_path, "r", encoding="utf-8") as f:
    content = f.read()

orig_payload = """      const newOrder = {
        user_id: user?.id || null,
        status: 'pending',
        total_amount: grandTotal,
        delivery_fee: deliveryFee,
        fulfillment_method: fulfillment,
        payment_method: payment,
        shipping_address: fulfillment === 'delivery' ? `${selectedGovernorate?.[`name_${lang}`] || 'Unknown'}, ${addressLine}` : 'Store Pickup',
        email: email,
        phone: phone,
        // Depending on DB schema, you might save first/last name, or a combined full_name
      };"""

new_payload = """      const newOrder = {
        customer_id: user?.id || null,
        status: 'pending',
        subtotal: cartSubtotal,
        delivery_fee: deliveryFee,
        total: grandTotal,
        fulfillment_type: fulfillment,
        payment_method: payment,
        governorate: fulfillment === 'delivery' ? selectedGovernorate?.[`governorate_${lang}`] || 'Unknown' : null,
        address_line: fulfillment === 'delivery' ? addressLine : null,
        guest_first_name: firstName,
        guest_last_name: lastName,
        guest_email: email,
        guest_phone: phone,
      };"""

content = content.replace(orig_payload, new_payload)

with open(checkout_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Checkout payload updated successfully.")
