import { useState } from 'react';
import ImageUploader from '../products/ImageUploader';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

export default function HeroEditor({ initialSettings }) {
  const [formData, setFormData] = useState({
    hero_headline_en: initialSettings.hero_headline_en || '',
    hero_headline_ar: initialSettings.hero_headline_ar || '',
    hero_subtext_en: initialSettings.hero_subtext_en || '',
    hero_subtext_ar: initialSettings.hero_subtext_ar || '',
    hero_cta_text_en: initialSettings.hero_cta_text_en || '',
    hero_cta_text_ar: initialSettings.hero_cta_text_ar || '',
    hero_cta_link: initialSettings.hero_cta_link || '',
    hero_image_url: initialSettings.hero_image_url || ''
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
      addToast('Hero settings saved successfully');
    } catch (err) {
      console.error(err);
      addToast('Failed to save hero settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Hero Section</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Headline (EN)</label>
            <input name="hero_headline_en" className="input" value={formData.hero_headline_en} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Headline (AR)</label>
            <input name="hero_headline_ar" className="input" value={formData.hero_headline_ar} onChange={handleChange} dir="rtl" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Subtext (EN)</label>
            <input name="hero_subtext_en" className="input" value={formData.hero_subtext_en} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Subtext (AR)</label>
            <input name="hero_subtext_ar" className="input" value={formData.hero_subtext_ar} onChange={handleChange} dir="rtl" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>CTA Text (EN)</label>
            <input name="hero_cta_text_en" className="input" value={formData.hero_cta_text_en} onChange={handleChange} placeholder="e.g. Shop Now" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>CTA Text (AR)</label>
            <input name="hero_cta_text_ar" className="input" value={formData.hero_cta_text_ar} onChange={handleChange} placeholder="e.g. تسوق الآن" dir="rtl" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>CTA Link</label>
            <input name="hero_cta_link" className="input" value={formData.hero_cta_link} onChange={handleChange} placeholder="e.g. /shop" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Hero Image</label>
          <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left', height: '160px' }}>
            <ImageUploader folder="site-assets" value={formData.hero_image_url} onChange={(val) => setFormData(p => ({ ...p, hero_image_url: val }))} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Hero Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
