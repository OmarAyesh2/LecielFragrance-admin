import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/Toast';

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories for mapping
      const { data: catData } = await supabase.from('categories').select('id, name_en');
      const catMap = {};
      if (catData) {
        catData.forEach(c => { catMap[c.id] = c.name_en; });
      }
      setCategories(catMap);

      // Fetch products
      const { data: prodData, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(prodData || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const extractFileName = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${product.name_en}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // 1. Delete image from storage if it exists
      if (product.image_url) {
        const fileName = extractFileName(product.image_url);
        if (fileName) {
          await supabase.storage.from('product-images').remove([fileName]);
        }
      }

      // 2. Delete product from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
        
      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== product.id));
      addToast('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      addToast('Failed to delete product', 'error');
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {products.length === 0 ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          No products found. Start by adding one!
        </div>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              <tr style={{ textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Product</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Type</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Category</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Price</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Stock</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '4px', backgroundColor: 'var(--color-border)',
                      backgroundImage: product.image_url ? `url(${product.image_url})` : 'none',
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }} />
                    <span style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{product.name_en}</span>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <span className="badge" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}>
                      {product.type}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>
                    {categories[product.category_id] || '-'}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                    {product.type === 'variant' ? '-' : `${Number(product.base_price).toFixed(2)} JOD`}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                    {product.type === 'variant' ? '-' : product.stock_quantity}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => navigate(`/products/${product.id}`)}>Edit</button>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px', color: 'var(--color-error)' }} onClick={() => handleDeleteProduct(product)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
