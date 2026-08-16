import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function PackageItemSelector({ items, onChange }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Fetch products that can be included in a package
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name_en, type')
        .in('type', ['single', 'variant'])
        .eq('is_active', true);
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    // If a variant product is selected, fetch its variants
    const fetchVariants = async () => {
      if (!selectedProduct) {
        setVariants([]);
        return;
      }
      const prod = products.find(p => p.id === selectedProduct);
      if (prod && prod.type === 'variant') {
        const { data } = await supabase
          .from('product_variants')
          .select('id, variant_label')
          .eq('product_id', selectedProduct);
        setVariants(data || []);
      } else {
        setVariants([]);
      }
      setSelectedVariant('');
    };
    fetchVariants();
  }, [selectedProduct, products]);

  const handleAddItem = () => {
    if (!selectedProduct) return;
    
    const prod = products.find(p => p.id === selectedProduct);
    if (prod.type === 'variant' && !selectedVariant) return;

    const varnt = variants.find(v => v.id === selectedVariant);

    const newItem = {
      id: Date.now().toString(),
      included_product_id: selectedProduct,
      included_variant_id: selectedVariant || null,
      quantity: Number(quantity),
      _productName: prod.name_en,
      _variantLabel: varnt ? varnt.variant_label : null
    };

    onChange([...items, newItem]);
    
    // Reset form
    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemove = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Existing Items */}
      {items.length > 0 && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: 'var(--space-2) var(--space-4)' }}>Product</th>
                <th style={{ padding: 'var(--space-2) var(--space-4)' }}>Variant</th>
                <th style={{ padding: 'var(--space-2) var(--space-4)' }}>Quantity</th>
                <th style={{ padding: 'var(--space-2) var(--space-4)' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id || i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-2) var(--space-4)' }}>{item._productName || item.included_product_id}</td>
                  <td style={{ padding: 'var(--space-2) var(--space-4)' }}>{item._variantLabel || '-'}</td>
                  <td style={{ padding: 'var(--space-2) var(--space-4)' }}>{item.quantity}</td>
                  <td style={{ padding: 'var(--space-2) var(--space-4)', textAlign: 'right' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => handleRemove(i)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Item Form */}
      <div className="card package-add-row" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Select Product</label>
          <select className="input" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
            <option value="">-- Select Product --</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name_en}</option>)}
          </select>
        </div>
        
        {variants.length > 0 && (
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Select Variant</label>
            <select className="input" value={selectedVariant} onChange={e => setSelectedVariant(e.target.value)}>
              <option value="">-- Select Variant --</option>
              {variants.map(v => <option key={v.id} value={v.id}>{v.variant_label}</option>)}
            </select>
          </div>
        )}

        <div style={{ width: '100px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Qty</label>
          <input type="number" min="1" className="input" value={quantity} onChange={e => setQuantity(e.target.value)} />
        </div>

        <button type="button" className="btn btn-primary" onClick={handleAddItem} disabled={!selectedProduct || (variants.length > 0 && !selectedVariant)}>
          Add Item
        </button>
      </div>
    </div>
  );
}
