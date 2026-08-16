import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

export default function ContactEditor({ initialSettings }) {
  const [formData, setFormData] = useState({
    promo_bar_text_en: initialSettings.promo_bar_text_en || '',
    promo_bar_text_ar: initialSettings.promo_bar_text_ar || '',
    promo_bar_visible: initialSettings.promo_bar_visible ?? true,
    about_text_en: initialSettings.about_text_en || '',
    about_text_ar: initialSettings.about_text_ar || '',
    mission_text_en: initialSettings.mission_text_en || '',
    mission_text_ar: initialSettings.mission_text_ar || '',
    compliance_text_en: initialSettings.compliance_text_en || '',
    compliance_text_ar: initialSettings.compliance_text_ar || '',
    phone: initialSettings.phone || '',
    email: initialSettings.email || '',
    address_en: initialSettings.address_en || '',
    address_ar: initialSettings.address_ar || '',
    instagram_url: initialSettings.instagram_url || '',
    facebook_url: initialSettings.facebook_url || ''
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
      addToast('Content & Contact settings saved');
    } catch (err) {
      console.error(err);
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Content & Contact</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        
        {/* Promo */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>Promo Bar</h3>
          <div className="grid-2" style={{ alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <input name="promo_bar_text_en" className="input" value={formData.promo_bar_text_en} onChange={handleChange} placeholder="Promo announcement text (EN)" />
            <input name="promo_bar_text_ar" className="input" value={formData.promo_bar_text_ar} onChange={handleChange} placeholder="Promo announcement text (AR)" dir="rtl" />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', gridColumn: '1 / -1' }}>
              <input type="checkbox" name="promo_bar_visible" checked={formData.promo_bar_visible} onChange={handleChange} />
              Show Promo Bar
            </label>
          </div>
        </div>

        {/* Story */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>Brand Story</h3>
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>About Text (EN)</label>
              <textarea name="about_text_en" className="input" rows="3" value={formData.about_text_en} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>About Text (AR)</label>
              <textarea name="about_text_ar" className="input" rows="3" value={formData.about_text_ar} onChange={handleChange} dir="rtl" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Mission Text (EN)</label>
              <textarea name="mission_text_en" className="input" rows="3" value={formData.mission_text_en} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Mission Text (AR)</label>
              <textarea name="mission_text_ar" className="input" rows="3" value={formData.mission_text_ar} onChange={handleChange} dir="rtl" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Compliance Text (EN)</label>
              <textarea name="compliance_text_en" className="input" rows="3" value={formData.compliance_text_en} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Compliance Text (AR)</label>
              <textarea name="compliance_text_ar" className="input" rows="3" value={formData.compliance_text_ar} onChange={handleChange} dir="rtl" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: 'var(--space-2)' }}>Contact Info</h3>
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Phone</label>
              <input name="phone" className="input" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Email</label>
              <input type="email" name="email" className="input" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Address (EN)</label>
              <textarea name="address_en" className="input" rows="2" value={formData.address_en} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Address (AR)</label>
              <textarea name="address_ar" className="input" rows="2" value={formData.address_ar} onChange={handleChange} dir="rtl" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Instagram URL</label>
              <input name="instagram_url" className="input" value={formData.instagram_url} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Facebook URL</label>
              <input name="facebook_url" className="input" value={formData.facebook_url} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Content & Contact'}
          </button>
        </div>
      </form>
    </div>
  );
}
