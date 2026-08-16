import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import StatsCard from '../components/dashboard/StatsCard';
import SalesChart from '../components/dashboard/SalesChart';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    orders: 0,
    avgOrderValue: 0,
    customers: 0
  });
  const [chartData, setChartData] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Orders for metrics & chart & recent
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!ordersError && ordersData) {
        const validOrders = ordersData.filter(o => o.status !== 'cancelled');
        const revenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const orderCount = validOrders.length;
        
        setMetrics(prev => ({
          ...prev,
          revenue,
          orders: orderCount,
          avgOrderValue: orderCount > 0 ? revenue / orderCount : 0
        }));

        setRecentOrders(ordersData.slice(0, 10));

        // Group by date for chart (simple logic)
        const grouped = validOrders.reduce((acc, order) => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        
        const sortedDates = Object.keys(grouped).sort();
        const mappedChartData = sortedDates.map(date => ({
          date,
          orders: grouped[date]
        }));
        
        // Ensure we have some mock data if empty for visual purposes (optional)
        setChartData(mappedChartData);
      }

      // 2. Fetch Active Customers
      const { count: customersCount, error: custError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');
        
      if (!custError) {
        setMetrics(prev => ({ ...prev, customers: customersCount || 0 }));
      }

      // 3. Fetch Low Stock Products
      const { data: lowProducts } = await supabase
        .from('products')
        .select('id, name_en, stock_quantity, sku')
        .eq('is_active', true)
        .eq('type', 'single')
        .lte('stock_quantity', 5);

      const { data: lowVariants } = await supabase
        .from('product_variants')
        .select(`
          id, product_id, stock_quantity, sku, variant_label,
          products!inner (name_en, is_active)
        `)
        .eq('products.is_active', true)
        .lte('stock_quantity', 5);

      let mergedStock = [];
      if (lowProducts) {
        mergedStock = [...mergedStock, ...lowProducts];
      }
      if (lowVariants) {
        lowVariants.forEach(v => {
          mergedStock.push({
            id: `v-${v.id}`,
            product_id: v.product_id,
            name_en: `${v.products.name_en} - ${v.variant_label}`,
            stock_quantity: v.stock_quantity,
            sku: v.sku
          });
        });
      }

      // Sort by stock ascending and limit to 10
      mergedStock.sort((a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0));
      setLowStock(mergedStock.slice(0, 10));
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Stats Row */}
      <div className="grid-stats">
        <StatsCard 
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>} 
          label="Total Revenue" 
          value={metrics.revenue} 
          format="currency" 
        />
        <StatsCard 
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>} 
          label="Total Orders" 
          value={metrics.orders} 
        />
        <StatsCard 
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>} 
          label="Avg. Order Value" 
          value={metrics.avgOrderValue} 
          format="currency" 
        />
        <StatsCard 
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} 
          label="Active Customers" 
          value={metrics.customers} 
        />
      </div>

      {/* Chart Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
        <SalesChart data={chartData} />
      </div>

      {/* Tables Row */}
      <div className="grid-dashboard-tables">
        {/* Low Stock Alerts */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Low Stock Alerts</h2>
          {lowStock.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Inventory looks good!</p>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: 'var(--space-2) 0' }}>Product</th>
                    <th style={{ padding: 'var(--space-2) 0' }}>SKU</th>
                    <th style={{ padding: 'var(--space-2) 0', textAlign: 'right' }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-3) 0' }}>
                        <Link to={`/products/${p.id}`} style={{ fontWeight: '500', color: 'var(--color-accent)' }}>
                          {p.name_en}
                        </Link>
                      </td>
                      <td style={{ padding: 'var(--space-3) 0', color: 'var(--color-text-secondary)' }}>{p.sku || '-'}</td>
                      <td style={{ padding: 'var(--space-3) 0', textAlign: 'right' }}>
                        <span className={`badge ${p.stock_quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} Left`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No recent orders.</p>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: 'var(--space-2) 0' }}>Order #</th>
                    <th style={{ padding: 'var(--space-2) 0' }}>Date</th>
                    <th style={{ padding: 'var(--space-2) 0', textAlign: 'right' }}>Total</th>
                    <th style={{ padding: 'var(--space-2) 0', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: 'var(--space-3) 0' }}>
                        <Link to={`/orders/${o.id}`} style={{ fontWeight: '500', color: 'var(--color-accent)' }}>
                          {o.id.substring(0, 8)}...
                        </Link>
                      </td>
                      <td style={{ padding: 'var(--space-3) 0', color: 'var(--color-text-secondary)' }}>
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 'var(--space-3) 0', textAlign: 'right' }}>{Number(o.total).toFixed(2)} JOD</td>
                      <td style={{ padding: 'var(--space-3) 0', textAlign: 'right' }}>
                        <span className={`badge ${
                          o.status === 'completed' ? 'badge-success' : 
                          o.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
