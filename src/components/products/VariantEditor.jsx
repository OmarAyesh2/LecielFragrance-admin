import ImageUploader from './ImageUploader';

export default function VariantEditor({ variants, onChange }) {
  const handleAdd = () => {
    onChange([...variants, { id: Date.now().toString(), variant_label: '', sku: '', price: 0, sale_price: '', stock_quantity: 0, image_url: '' }]);
  };

  const handleRemove = (index) => {
    if (window.confirm('Are you sure you want to remove this variant?')) {
      const newVariants = [...variants];
      newVariants.splice(index, 1);
      onChange(newVariants);
    }
  };

  const handleChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    onChange(newVariants);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {variants.map((v, i) => (
        <div key={v.id || i} className="card variant-row">
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Image</label>
            <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200px', height: '100px' }}>
              <ImageUploader value={v.image_url} onChange={(val) => handleChange(i, 'image_url', val)} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Label *</label>
            <input className="input" value={v.variant_label} onChange={e => handleChange(i, 'variant_label', e.target.value)} required placeholder="e.g. 100ml" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>SKU</label>
            <input className="input" value={v.sku} onChange={e => handleChange(i, 'sku', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Price *</label>
            <input type="number" step="0.01" className="input" value={v.price} onChange={e => handleChange(i, 'price', e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Sale Price</label>
            <input type="number" step="0.01" className="input" value={v.sale_price} onChange={e => handleChange(i, 'sale_price', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px' }}>Stock</label>
            <input type="number" className="input" value={v.stock_quantity} onChange={e => handleChange(i, 'stock_quantity', e.target.value)} />
          </div>
          <div style={{ paddingTop: '22px' }}>
            <button type="button" className="btn btn-danger" onClick={() => handleRemove(i)}>Remove</button>
          </div>
        </div>
      ))}
      <div>
        <button type="button" className="btn btn-ghost" style={{ border: '1px dashed var(--color-border)' }} onClick={handleAdd}>
          + Add Variant
        </button>
      </div>
    </div>
  );
}
