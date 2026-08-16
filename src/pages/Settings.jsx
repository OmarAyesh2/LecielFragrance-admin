import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import BrandSettings from '../components/settings/BrandSettings';
import HeroEditor from '../components/settings/HeroEditor';
import ContactEditor from '../components/settings/ContactEditor';
import CheckoutSettings from '../components/settings/CheckoutSettings';
import DeliveryFeeEditor from '../components/settings/DeliveryFeeEditor';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [deliveryFees, setDeliveryFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    setLoading(true);
    try {
      // 1. Fetch site settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      if (settingsData) setSettings(settingsData);

      // 2. Fetch delivery fees
      const { data: feesData, error: feesError } = await supabase
        .from('delivery_fees')
        .select('*')
        .order('id');
      
      if (feesError) throw feesError;
      setDeliveryFees(feesData || []);

    } catch (err) {
      console.error(err);
      addToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 'var(--space-6)' }}>Loading settings...</div>;
  if (!settings) return <div style={{ padding: 'var(--space-6)' }}>No site settings found in the database.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Site Settings</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
          Manage your storefront content, brand assets, and checkout rules.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
        <BrandSettings initialSettings={settings} />
        <HeroEditor initialSettings={settings} />
        <ContactEditor initialSettings={settings} />
        <CheckoutSettings initialSettings={settings} />
        <DeliveryFeeEditor initialFees={deliveryFees} />
      </div>
    </div>
  );
}
