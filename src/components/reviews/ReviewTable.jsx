import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

export default function ReviewTable() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          product:product_id(name_en)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      
      addToast('Review deleted');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      addToast('Failed to delete review', 'error');
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Product Reviews</h2>
      </div>
      
      {loading ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No reviews found.</div>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              <tr style={{ textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Date</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Product</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Reviewer</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Rating</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', width: '40%' }}>Comment</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: '500' }}>
                    {review.product?.name_en || 'Unknown Product'}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    {review.reviewer_name}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: '#F59E0B' }}>
                    {renderStars(review.rating)}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    {review.comment}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                    <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => handleDelete(review.id)}>
                      Delete
                    </button>
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
