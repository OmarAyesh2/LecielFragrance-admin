import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

export default function DeliveryFeeEditor({ initialFees }) {
  const [fees, setFees] = useState(initialFees || []);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const handleFeeChange = (index, value) => {
    const newFees = [...fees];
    newFees[index].fee = value;
    setFees(newFees);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      for (const feeObj of fees) {
        await supabase
          .from('delivery_fees')
          .update({ fee: feeObj.fee })
          .eq('id', feeObj.id);
      }
      addToast('Delivery fees saved successfully');
    } catch (err) {
      console.error(err);
      addToast('Failed to save delivery fees', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!fees.length) return <div className="card">No delivery fees found.</div>;

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Delivery Fees (JOD)</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {fees.map((feeObj, index) => (
            <div key={feeObj.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{feeObj.governorate_en}</span>
              <input 
                type="number" 
                step="0.25"
                className="input" 
                style={{ width: '80px', padding: '4px', textAlign: 'right' }}
                value={feeObj.fee} 
                onChange={(e) => handleFeeChange(index, e.target.value)} 
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Delivery Fees'}
          </button>
        </div>
      </form>
    </div>
  );
}
