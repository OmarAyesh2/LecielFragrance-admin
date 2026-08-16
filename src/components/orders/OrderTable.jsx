import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { useToast } from '../ui/Toast';
import OrderStatusBadge from './OrderStatusBadge';

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (order) => {
    if (order.guest_first_name || order.guest_last_name) {
      return `${order.guest_first_name || ''} ${order.guest_last_name || ''}`.trim() + (order.customer_id ? '' : ' (Guest)');
    }
    return 'Unknown Customer';
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'All') return orders;
    return orders.filter(o => o.status?.toLowerCase() === statusFilter.toLowerCase());
  }, [orders, statusFilter]);

  const statuses = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Top Bar with Filter */}
      <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Orders</h2>
        
        <div>
          <select 
            className="input" 
            style={{ width: 'auto', padding: 'var(--space-1) var(--space-3)' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Table */}
      {loading ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          No orders found matching this filter.
        </div>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              <tr style={{ textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Order #</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Date</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Customer</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Total</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Payment</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: '500' }}>
                    {order.order_number || order.id.substring(0,8).toUpperCase()}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>
                    {new Date(order.created_at).toLocaleString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    {getCustomerName(order)}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                    {Number(order.total).toFixed(2)} JOD
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    {order.payment_method}
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                    <Link to={`/orders/${order.id}`} className="btn btn-ghost" style={{ padding: '4px 8px' }}>
                      View
                    </Link>
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
