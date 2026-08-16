import os

base_dir = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\storefront\src"
cart_path = os.path.join(base_dir, "context", "CartContext.js")

with open(cart_path, "r", encoding="utf-8") as f:
    content = f.read()

original_add = """  const addToCart = async (newItem) => {
    if (user) {
      // DB Mutation
      const existing = cartItems.find(item => item.productId === newItem.productId && item.variantId === newItem.variantId);
      if (existing) {
        const newQty = existing.quantity + (newItem.quantity || 1);
        await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.cartItemId);
        setCartItems(prev => prev.map(i => i.cartItemId === existing.cartItemId ? { ...i, quantity: newQty } : i));
      } else {
        const { data, error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: newItem.productId,
          variant_id: newItem.variantId || null,
          quantity: newItem.quantity || 1
        }).select().single();
        if (!error && data) {
          setCartItems(prev => [...prev, { ...newItem, quantity: newItem.quantity || 1, cartItemId: data.id }]);
        }
      }
    } else {
      // Local State
      setCartItems(prev => {
        const existingIndex = prev.findIndex(item => 
          item.productId === newItem.productId && item.variantId === newItem.variantId
        );
        if (existingIndex > -1) {
          const copy = [...prev];
          copy[existingIndex].quantity += newItem.quantity || 1;
          return copy;
        }
        return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
      });
    }
  };"""

new_add = """  const addToCart = async (newItem) => {
    if (user) {
      // DB Mutation
      const existing = cartItems.find(item => item.productId === newItem.productId && item.variantId === newItem.variantId);
      if (existing) {
        const newQty = existing.quantity + (newItem.quantity || 1);
        const { error } = await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.cartItemId);
        
        if (error) {
          alert("Database Error: " + error.message);
          return;
        }
        setCartItems(prev => prev.map(i => i.cartItemId === existing.cartItemId ? { ...i, quantity: newQty } : i));
      } else {
        const { data, error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: newItem.productId,
          variant_id: newItem.variantId || null,
          quantity: newItem.quantity || 1
        }).select().single();
        
        if (error) {
          alert("Database Error: " + error.message);
          return;
        }
        if (data) {
          setCartItems(prev => [...prev, { ...newItem, quantity: newItem.quantity || 1, cartItemId: data.id }]);
        }
      }
    } else {
      // Local State
      setCartItems(prev => {
        const existingIndex = prev.findIndex(item => 
          item.productId === newItem.productId && item.variantId === newItem.variantId
        );
        if (existingIndex > -1) {
          const copy = [...prev];
          copy[existingIndex].quantity += newItem.quantity || 1;
          return copy;
        }
        return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
      });
    }
  };"""

content = content.replace(original_add, new_add)

with open(cart_path, "w", encoding="utf-8") as f:
    f.write(content)

print("CartContext addToCart updated successfully.")
