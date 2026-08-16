import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

export default function CheckoutSettings({ initialSettings }) {
  const [formData, setFormData] = useState({
    pickup_enabled: initialSettings.pickup_enabled ?? true,
    pickup_address_en: initialSettings.pickup_address_en || '',
    pickup_address_ar: initialSettings.pickup_address_ar || '',
    cliq_enabled: initialSettings.cliq_enabled ?? true,
    cliq_alias: initialSettings.cliq_alias || ''
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(formData)
        .eq('id', initialSettings.id);
      
      if (error) throw error;
      addToast('Checkout settings saved successfully');
    } catch (err) {
      console.error(err);
      addToast('Failed to save checkout settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Checkout Options</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        
        {/* Store Pickup */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>Store Pickup</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" name="pickup_enabled" checked={formData.pickup_enabled} onChange={handleChange} />
              Enable Store Pickup
            </label>
            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Pickup Address (EN)</label>
                <textarea name="pickup_address_en" className="input" rows="2" value={formData.pickup_address_en} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Pickup Address (AR)</label>
                <textarea name="pickup_address_ar" className="input" rows="2" value={formData.pickup_address_ar} onChange={handleChange} dir="rtl" />
              </div>
            </div>
          </div>
        </div>

        {/* CliQ Payment */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>CliQ Payment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" name="cliq_enabled" checked={formData.cliq_enabled} onChange={handleChange} />
              Enable CliQ
            </label>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>CliQ Alias</label>
              <input name="cliq_alias" className="input" value={formData.cliq_alias} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Checkout Options'}
          </button>
        </div>
      </form>
    </div>
  );
}
