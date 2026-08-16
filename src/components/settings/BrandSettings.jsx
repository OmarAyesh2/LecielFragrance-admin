import { useState } from 'react';
import ImageUploader from '../products/ImageUploader';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

export default function BrandSettings({ initialSettings }) {
  const [formData, setFormData] = useState({
    store_name_en: initialSettings.store_name_en || '',
    store_name_ar: initialSettings.store_name_ar || '',
    jfda_registration_number: initialSettings.jfda_registration_number || '',
    logo_url: initialSettings.logo_url || '',
    favicon_url: initialSettings.favicon_url || ''
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      addToast('Brand settings saved successfully');
    } catch (err) {
      console.error(err);
      addToast('Failed to save brand settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Brand Settings</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Store Name (EN)</label>
            <input name="store_name_en" className="input" value={formData.store_name_en} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Store Name (AR)</label>
            <input name="store_name_ar" className="input" value={formData.store_name_ar} onChange={handleChange} dir="rtl" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>JFDA Registration Number</label>
            <input name="jfda_registration_number" className="input" value={formData.jfda_registration_number} onChange={handleChange} />
          </div>
        </div>

        <div className="grid-2">
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Logo</label>
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left', height: '160px' }}>
              <ImageUploader folder="site-assets" value={formData.logo_url} onChange={(val) => setFormData(p => ({ ...p, logo_url: val }))} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Favicon</label>
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left', height: '160px' }}>
              <ImageUploader folder="site-assets" value={formData.favicon_url} onChange={(val) => setFormData(p => ({ ...p, favicon_url: val }))} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Brand Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
