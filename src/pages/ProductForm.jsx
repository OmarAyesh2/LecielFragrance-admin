import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import ImageUploader from '../components/products/ImageUploader';
import VariantEditor from '../components/products/VariantEditor';
import PackageItemSelector from '../components/products/PackageItemSelector';

const initialFormState = {
  type: 'single',
  name_en: '', name_ar: '',
  slug: '', category_id: '', sku: '',
  image_url: '',
  gallery_images: [],
  base_price: 0, sale_price: '', stock_quantity: 0,
  description_en: '', description_ar: '',
  ingredients_en: '', ingredients_ar: '',
  benefits_en: '', benefits_ar: '',
  usage_instructions_en: '', usage_instructions_ar: '',
  is_active: true, is_featured: false, is_bestseller: false,
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState(initialFormState);
  const [variants, setVariants] = useState([]);
  const [packageItems, setPackageItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: catData } = await supabase.from('categories').select('*').order('sort_order');
      if (catData) setCategories(catData);

      if (id) {
        setIsEdit(true);
        // Fetch product
        const { data: prodData, error: prodErr } = await supabase.from('products').select('*').eq('id', id).single();
        if (prodErr) throw prodErr;
        
        setFormData({
          ...prodData,
          gallery_images: prodData.gallery_images || []
        });

        // Fetch variants if applicable
        if (prodData.type === 'variant') {
          const { data: varData } = await supabase.from('product_variants').select('*').eq('product_id', id);
          if (varData) setVariants(varData);
        }

        // Fetch package items if applicable
        if (prodData.type === 'package') {
          const { data: pkgData } = await supabase.from('package_items').select(`
            *,
            product:included_product_id(name_en),
            variant:included_variant_id(variant_label)
          `).eq('package_product_id', id);
          
          if (pkgData) {
            const mapped = pkgData.map(p => ({
              ...p,
              _productName: p.product?.name_en,
              _variantLabel: p.variant?.variant_label
            }));
            setPackageItems(mapped);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      addToast('Failed to load product data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      // Auto-generate slug from name_en if slug is untouched or we are typing name_en
      if (name === 'name_en' && !isEdit) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Validate
      if (!formData.name_en || !formData.name_ar) throw new Error('Names are required');
      if (!formData.category_id) throw new Error('Category is required');

      let productId = id;

      // Ensure empty strings are cast to null for unique constraints
      const payload = {
        ...formData,
        sale_price: formData.sale_price === '' ? null : formData.sale_price,
        sku: formData.sku === '' ? null : formData.sku,
      };

      if (isEdit) {
        // Remove created_at, updated_at
        delete payload.created_at;
        delete payload.updated_at;
        
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert([payload]).select();
        if (error) throw error;
        productId = data[0].id;
      }

      // Handle Variants
      if (formData.type === 'variant') {
        // Delete all existing variants (simple approach) or diff.
        // For simplicity: delete all then insert new (Not recommended for prod if tracking ids, but ok for demo)
        // Better: Upsert
        if (isEdit) {
            await supabase.from('product_variants').delete().eq('product_id', productId);
        }
        
        if (variants.length > 0) {
            const variantPayloads = variants.map((v, i) => ({
                product_id: productId,
                variant_label: v.variant_label,
                sku: v.sku,
                price: v.price,
                sale_price: v.sale_price === '' ? null : v.sale_price,
                stock_quantity: v.stock_quantity,
                image_url: v.image_url,
                sort_order: i
            }));
            const { error: varErr } = await supabase.from('product_variants').insert(variantPayloads);
            if (varErr) throw varErr;
        }
      }

      // Handle Package Items
      if (formData.type === 'package') {
        if (isEdit) {
            await supabase.from('package_items').delete().eq('package_product_id', productId);
        }
        
        if (packageItems.length > 0) {
            const pkgPayloads = packageItems.map(p => ({
                package_product_id: productId,
                included_product_id: p.included_product_id,
                included_variant_id: p.included_variant_id,
                quantity: p.quantity
            }));
            const { error: pkgErr } = await supabase.from('package_items').insert(pkgPayloads);
            if (pkgErr) throw pkgErr;
        }
      }

      addToast(isEdit ? 'Product updated successfully' : 'Product created successfully');
      navigate('/products');
    } catch (err) {
      console.error('Save error:', err);
      if (err.code === '23505') {
        if (err.message?.includes('slug')) {
          addToast('A product with this URL Slug already exists. Please modify the Slug field.', 'error');
        } else if (err.message?.includes('sku')) {
          addToast('A product with this SKU already exists. Please use a unique SKU.', 'error');
        } else {
          addToast('A unique field already exists (e.g. SKU or Slug).', 'error');
        }
      } else {
        addToast(err.message || 'Failed to save product', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* 1. Basic Info */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Basic Information</h2>
        
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>Product Type</label>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            {['single', 'variant', 'package'].map(type => (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="radio" name="type" value={type} checked={formData.type === type} onChange={handleInputChange} disabled={isEdit} />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
          {isEdit && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Cannot change type after creation.</div>}
        </div>

        <div className="grid-2">
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Name (EN) *</label>
            <input name="name_en" className="input" value={formData.name_en} onChange={handleInputChange} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Name (AR) *</label>
            <input name="name_ar" className="input" value={formData.name_ar} onChange={handleInputChange} required dir="rtl" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Slug</label>
            <input name="slug" className="input" value={formData.slug} onChange={handleInputChange} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Category *</label>
            <select name="category_id" className="input" value={formData.category_id} onChange={handleInputChange} required>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Media */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Product Media</h2>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>Main Thumbnail *</label>
          <ImageUploader value={formData.image_url} onChange={url => setFormData(p => ({ ...p, image_url: url }))} />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>Additional Gallery Images</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            {(formData.gallery_images || []).map((url, index) => (
              <div key={index}>
                <ImageUploader 
                  value={url} 
                  onChange={(newUrl) => {
                    setFormData(p => {
                      const newGallery = [...(p.gallery_images || [])];
                      if (newUrl) {
                        newGallery[index] = newUrl;
                      } else {
                        newGallery.splice(index, 1);
                      }
                      return { ...p, gallery_images: newGallery };
                    });
                  }} 
                />
              </div>
            ))}
            {/* Empty uploader for adding a new image */}
            <div>
              <ImageUploader 
                value={''} 
                onChange={(newUrl) => {
                  if (newUrl) {
                    setFormData(p => ({
                      ...p,
                      gallery_images: [...(p.gallery_images || []), newUrl]
                    }));
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Pricing & Inventory */}
      {formData.type !== 'variant' && (
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Pricing & Inventory</h2>
          <div className="grid-3">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Base Price (JOD) *</label>
              <input type="number" step="0.01" name="base_price" className="input" value={formData.base_price} onChange={handleInputChange} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Sale Price (JOD)</label>
              <input type="number" step="0.01" name="sale_price" className="input" value={formData.sale_price} onChange={handleInputChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>SKU</label>
              <input name="sku" className="input" value={formData.sku} onChange={handleInputChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Stock Quantity</label>
              <input type="number" name="stock_quantity" className="input" value={formData.stock_quantity} onChange={handleInputChange} />
            </div>
          </div>
        </div>
      )}

      {/* Conditional: Variants */}
      {formData.type === 'variant' && (
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Variants</h2>
          <VariantEditor variants={variants} onChange={setVariants} />
        </div>
      )}

      {/* Conditional: Package Items */}
      {formData.type === 'package' && (
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Package Items</h2>
          <PackageItemSelector items={packageItems} onChange={setPackageItems} />
        </div>
      )}

      {/* 4. Details */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Product Details</h2>
        
        {['description', 'ingredients', 'benefits', 'usage_instructions'].map(field => (
          <div key={field} className="grid-2" style={{ marginBottom: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', textTransform: 'capitalize' }}>{field.replace('_', ' ')} (EN)</label>
              <textarea name={`${field}_en`} className="input" rows="4" value={formData[`${field}_en`]} onChange={handleInputChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', textTransform: 'capitalize' }}>{field.replace('_', ' ')} (AR)</label>
              <textarea name={`${field}_ar`} className="input" rows="4" value={formData[`${field}_ar`]} onChange={handleInputChange} dir="rtl" />
            </div>
          </div>
        ))}
      </div>

      {/* 5. Visibility */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Visibility</h2>
        <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
            Active
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} />
            Featured
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" name="is_bestseller" checked={formData.is_bestseller} onChange={handleInputChange} />
            Bestseller
          </label>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)' }}>
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/products')} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
        </button>
      </div>

    </form>
  );
}
