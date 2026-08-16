import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import ImageUploader from '../products/ImageUploader';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    slug: '',
    sort_order: 0,
    image_url: ''
  });
  
  // Reorder state
  const [orderChanges, setOrderChanges] = useState({});
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
      setOrderChanges({});
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Auto slug logic if not editing and changing name_en
      if (name === 'name_en' && !editingId) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return next;
    });
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name_en: cat.name_en,
      name_ar: cat.name_ar,
      slug: cat.slug,
      sort_order: cat.sort_order,
      image_url: cat.image_url || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name_en: '', name_ar: '', slug: '', sort_order: 0, image_url: '' });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name_en || !formData.name_ar) {
      addToast('Names are required', 'error');
      return;
    }
    
    setSaving(true);
    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
        addToast('Category updated successfully');
      } else {
        // Insert
        const { error } = await supabase
          .from('categories')
          .insert([formData]);
        if (error) throw error;
        addToast('Category created successfully');
      }
      
      handleCancelEdit();
      fetchCategories();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Error saving category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      addToast('Category deleted');
      fetchCategories();
    } catch (err) {
      console.error(err);
      addToast('Failed to delete', 'error');
    }
  };

  const handleSortChange = (id, newSortOrder) => {
    setOrderChanges(prev => ({ ...prev, [id]: Number(newSortOrder) }));
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const updates = Object.keys(orderChanges).map(id => ({
        id,
        sort_order: orderChanges[id]
      }));

      // Supabase js currently requires looping for individual updates or using an RPC/bulk update mechanism.
      // We'll loop for simplicity since categories are usually few.
      for (const update of updates) {
        await supabase.from('categories').update({ sort_order: update.sort_order }).eq('id', update.id);
      }
      
      addToast('Order saved successfully');
      fetchCategories();
    } catch (err) {
      console.error(err);
      addToast('Failed to save order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const hasOrderChanges = Object.keys(orderChanges).length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Inline Form */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
          {editingId ? 'Edit Category' : 'Add New Category'}
        </h2>
        <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Sort Order</label>
              <input type="number" name="sort_order" className="input" value={formData.sort_order} onChange={handleInputChange} />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Category Image</label>
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left', height: '160px' }}>
              <ImageUploader folder="category-images" value={formData.image_url} onChange={(val) => setFormData(p => ({ ...p, image_url: val }))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={handleCancelEdit}>Cancel</button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (editingId ? 'Update Category' : 'Add Category')}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Categories</h2>
          {hasOrderChanges && (
            <button className="btn btn-primary" onClick={handleSaveOrder} disabled={saving}>
              {saving ? 'Saving...' : 'Save Sort Order'}
            </button>
          )}
        </div>
        
        {loading ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Loading...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No categories found.</div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <tr style={{ textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', width: '100px' }}>Order</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Image</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Name (EN)</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Name (AR)</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Slug</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <input 
                        type="number" 
                        className="input" 
                        style={{ width: '70px', padding: '4px' }}
                        value={orderChanges[cat.id] !== undefined ? orderChanges[cat.id] : cat.sort_order} 
                        onChange={(e) => handleSortChange(cat.id, e.target.value)}
                      />
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '4px', backgroundColor: 'var(--color-border)',
                        backgroundImage: cat.image_url ? `url(${cat.image_url})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center'
                      }} />
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: '500' }}>{cat.name_en}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }} dir="rtl">{cat.name_ar}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>{cat.slug}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => handleEditClick(cat)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => handleDelete(cat.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
