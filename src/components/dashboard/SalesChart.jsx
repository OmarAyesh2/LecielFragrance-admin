import { useState, useMemo } from 'react';

export default function SalesChart({ data }) {
  const [range, setRange] = useState(7); // 7, 30, 90

  // Filter and format data based on range
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // In a real app, you'd filter by date relative to today.
    // For this UI, we just slice the last N items (assuming they are sorted ascending by date).
    const recent = data.slice(-range);
    
    // Find max value to calculate percentage heights
    const maxOrders = Math.max(...recent.map(d => d.orders), 1);
    
    return recent.map(d => ({
      ...d,
      heightPct: (d.orders / maxOrders) * 100
    }));
  }, [data, range]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Orders Overview</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)', backgroundColor: 'var(--color-bg)', padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)' }}>
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setRange(days)}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                fontSize: '0.75rem',
                fontWeight: '500',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: range === days ? 'var(--color-bg-card)' : 'transparent',
                color: range === days ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: range === days ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
          No data available
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px', paddingTop: 'var(--space-4)', position: 'relative' }}>
          {chartData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ 
                width: '100%', 
                height: '200px', 
                display: 'flex', 
                alignItems: 'flex-end',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '4px 4px 0 0',
                position: 'relative'
              }}>
                <div style={{
                  width: '100%',
                  height: `${d.heightPct}%`,
                  backgroundColor: 'var(--color-accent)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease'
                }} title={`${d.orders} orders on ${d.date}`} />
              </div>
              {/* Only show labels if range is small, otherwise it gets too crowded, or show selectively */}
              {range <= 7 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
