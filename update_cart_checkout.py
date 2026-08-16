import os

base_dir = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\storefront\src"

new_cart_context = """'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Load initial cart
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Fetch from DB
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select(`
              id,
              product_id,
              variant_id,
              quantity,
              products (
                name_en,
                name_ar,
                image_url,
                base_price,
                sale_price
              )
            `)
            .eq('user_id', user.id);

          if (!error && data) {
            // Map data to local state format
            const dbCart = data.map(item => ({
              cartItemId: item.id,
              productId: item.product_id,
              variantId: item.variant_id,
              quantity: item.quantity,
              name_en: item.products.name_en,
              name_ar: item.products.name_ar,
              image_url: item.products.image_url,
              price: item.products.sale_price || item.products.base_price,
            }));

            // Merge local cart if exists
            const saved = localStorage.getItem('leciel-cart');
            if (saved) {
              try {
                const localCart = JSON.parse(saved);
                if (localCart.length > 0) {
                  for (const localItem of localCart) {
                    const existing = dbCart.find(i => i.productId === localItem.productId && i.variantId === localItem.variantId);
                    if (existing) {
                      // Update DB quantity
                      const newQty = existing.quantity + localItem.quantity;
                      await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.cartItemId);
                      existing.quantity = newQty;
                    } else {
                      // Insert new to DB
                      const { data: newDbItem } = await supabase.from('cart_items').insert({
                        user_id: user.id,
                        product_id: localItem.productId,
                        variant_id: localItem.variantId,
                        quantity: localItem.quantity
                      }).select().single();
                      
                      if (newDbItem) {
                        dbCart.push({
                          ...localItem,
                          cartItemId: newDbItem.id
                        });
                      }
                    }
                  }
                  // Clear local cart
                  localStorage.removeItem('leciel-cart');
                }
              } catch (e) {
                console.error('Error merging local cart', e);
              }
            }
            setCartItems(dbCart);
          }
        } catch (err) {
          console.error("Failed to load DB cart", err);
        }
      } else {
        // Load from local storage
        const saved = localStorage.getItem('leciel-cart');
        if (saved) {
          try { setCartItems(JSON.parse(saved)); } catch (e) {}
        }
      }
      setIsInitialized(true);
    };

    loadCart();
  }, [user]);

  // Save to local storage for guests ONLY
  useEffect(() => {
    if (isInitialized && !user) {
      localStorage.setItem('leciel-cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized, user]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const addToCart = async (newItem) => {
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
  };

  const removeFromCart = async (productId, variantId) => {
    if (user) {
      const existing = cartItems.find(i => i.productId === productId && i.variantId === variantId);
      if (existing && existing.cartItemId) {
        await supabase.from('cart_items').delete().eq('id', existing.cartItemId);
      }
    }
    setCartItems(prev => prev.filter(item => 
      !(item.productId === productId && item.variantId === variantId)
    ));
  };

  const updateQuantity = async (productId, variantId, qty) => {
    if (qty < 1) return removeFromCart(productId, variantId);
    
    if (user) {
      const existing = cartItems.find(i => i.productId === productId && i.variantId === variantId);
      if (existing && existing.cartItemId) {
        await supabase.from('cart_items').update({ quantity: qty }).eq('id', existing.cartItemId);
      }
    }
    setCartItems(prev => prev.map(item => 
      (item.productId === productId && item.variantId === variantId) ? { ...item, quantity: qty } : item
    ));
  };

  const clearCart = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }
    setCartItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{ 
      cartItems, cartCount, cartSubtotal, 
      addToCart, removeFromCart, updateQuantity, clearCart, 
      isCartOpen, openCart, closeCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
"""

# Update CartContext.js
cc_path = os.path.join(base_dir, "context", "CartContext.js")
with open(cc_path, "w", encoding="utf-8") as f:
    f.write(new_cart_context)


# Update CheckoutClient.js
co_path = os.path.join(base_dir, "components", "checkout", "CheckoutClient.js")
with open(co_path, "r", encoding="utf-8") as f:
    co_content = f.read()

# 1. Governorate Dropdown Fix
co_content = co_content.replace(
    "{gov[`name_${lang}`]} - {gov.fee} JOD",
    "{gov[`governorate_${lang}`]} - {gov.fee} JOD"
)

# 2 & 3. Replace Icons and Add CliQ Alias Block
co_content = co_content.replace(
    "<span>🚚 {lang === 'ar' ? 'توصيل للمنزل' : 'Home Delivery'}</span>",
    "<span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.5\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect x=\"1\" y=\"3\" width=\"15\" height=\"13\"></rect><polygon points=\"16 8 20 8 23 11 23 16 16 16 16 8\"></polygon><circle cx=\"5.5\" cy=\"18.5\" r=\"2.5\"></circle><circle cx=\"18.5\" cy=\"18.5\" r=\"2.5\"></circle></svg> {lang === 'ar' ? 'توصيل للمنزل' : 'Home Delivery'}</span>"
)

co_content = co_content.replace(
    "<span>🏪 {lang === 'ar' ? 'استلام من المتجر' : 'Store Pickup'}</span>",
    "<span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.5\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"></path><polyline points=\"9 22 9 12 15 12 15 22\"></polyline></svg> {lang === 'ar' ? 'استلام من المتجر' : 'Store Pickup'}</span>"
)

co_content = co_content.replace(
    "<span>💵 {lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>",
    "<span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"1.5\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M6 12h.01M18 12h.01\"></path></svg> {lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>"
)

# For CliQ, we need to add the alias block right after the label
cliq_original = "<span>⚡ CliQ</span>\n                  </label>"
cliq_new = """<span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> CliQ</span>
                  </label>
                  {payment === 'cliq' && <div style={{marginTop: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--color-text-secondary)'}}>Transfer to Alias: {settings?.cliq_alias}</div>}"""

co_content = co_content.replace(cliq_original, cliq_new)

with open(co_path, "w", encoding="utf-8") as f:
    f.write(co_content)

print("Checkout and CartContext applied successfully.")
