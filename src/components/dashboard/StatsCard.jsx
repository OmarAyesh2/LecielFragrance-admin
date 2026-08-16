export default function StatsCard({ icon, label, value, format = 'number' }) {
  const displayValue = format === 'currency' 
    ? `${Number(value).toFixed(2)} JOD` 
    : Number(value).toLocaleString();

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        fontSize: '1.5rem',
        backgroundColor: '#EEF2FF', /* Soft Indigo */
        color: 'var(--color-accent)',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          {displayValue}
        </div>
      </div>
    </div>
  );
}
