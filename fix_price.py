import os

base_dir = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\storefront\src"
cart_path = os.path.join(base_dir, "context", "CartContext.js")

with open(cart_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace loadCart insert
orig_load_insert = """                      // Insert new to DB
                      const { data: newDbItem } = await supabase.from('cart_items').insert({
                        user_id: user.id,
                        product_id: localItem.productId,
                        variant_id: localItem.variantId,
                        quantity: localItem.quantity
                      }).select().single();"""

new_load_insert = """                      // Insert new to DB
                      const { data: newDbItem } = await supabase.from('cart_items').insert({
                        user_id: user.id,
                        product_id: localItem.productId,
                        variant_id: localItem.variantId,
                        quantity: localItem.quantity,
                        price: localItem.price
                      }).select().single();"""

# Replace addToCart insert
orig_add_insert = """        const { data, error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: newItem.productId,
          variant_id: newItem.variantId || null,
          quantity: newItem.quantity || 1
        }).select().single();"""

new_add_insert = """        const { data, error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: newItem.productId,
          variant_id: newItem.variantId || null,
          quantity: newItem.quantity || 1,
          price: newItem.price
        }).select().single();"""

content = content.replace(orig_load_insert, new_load_insert)
content = content.replace(orig_add_insert, new_add_insert)

with open(cart_path, "w", encoding="utf-8") as f:
    f.write(content)

print("CartContext price added successfully.")
