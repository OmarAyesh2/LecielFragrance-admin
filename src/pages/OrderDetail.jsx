import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import InvoicePrint from '../components/orders/InvoicePrint';

export default function OrderDetail() {
  const { id } = useParams();
  const { addToast } = useToast();
  
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch Order
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
        
      if (orderErr) throw orderErr;
      setOrder(orderData);

      // 2. Fetch Order Items + Products + Variants
      const { data: itemsData, error: itemsErr } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id(name_en, name_ar),
          variant:variant_id(variant_label)
        `)
        .eq('order_id', id);

      if (itemsErr) throw itemsErr;
      setItems(itemsData || []);
      
      // 3. Fetch Settings
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (settingsData) setSettings(settingsData);
      
    } catch (err) {
      console.error(err);
      addToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setOrder(prev => ({ ...prev, status: newStatus }));
      addToast(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      addToast('Failed to update status', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = order.order_number || order.id;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  if (loading) return <div style={{ padding: 'var(--space-6)' }}>Loading order details...</div>;
  if (!order) return <div style={{ padding: 'var(--space-6)' }}>Order not found.</div>;

  const customerName = `${order.guest_first_name || ''} ${order.guest_last_name || ''}`.trim() + (order.customer_id ? '' : ' (Guest)');

  const customerPhone = order.guest_phone || 'N/A';
  const customerEmail = order.guest_email || 'N/A';

  const subtotal = Number(order.total) - Number(order.delivery_fee || 0);

  return (
    <>
      {/* Hidden Invoice Component for Printing */}
      <InvoicePrint order={order} items={items} customerName={customerName} settings={settings} />

      {/* Main UI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        
        {/* Header & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link to="/orders" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-2)', display: 'inline-block' }}>
              &larr; Back to Orders
            </Link>
            <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: '700', margin: 0 }}>
              Order {order.order_number || `#${order.id.substring(0,8).toUpperCase()}`}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Status:</span>
              <select 
                className="input" 
                style={{ width: 'auto', padding: 'var(--space-1) var(--space-3)' }}
                value={order.status}
                onChange={handleStatusChange}
                disabled={statusUpdating}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <OrderStatusBadge status={order.status} />
            </div>
            
            <button className="btn btn-primary" onClick={handlePrint}>
              🖨️ Print Invoice
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {/* Customer Info Card */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Customer Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
              <div><strong>Name:</strong> {customerName}</div>
              <div><strong>Email:</strong> {customerEmail}</div>
              <div><strong>Phone:</strong> <span dir="ltr">{customerPhone}</span></div>
            </div>
          </div>

          {/* Fulfillment Info Card */}
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--space-4)' }}>Fulfillment & Payment</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
              <div>
                <strong>Payment Method:</strong> 
                <span style={{ marginLeft: '8px' }}>
                  {order.payment_method?.toLowerCase() === 'cod' ? '💵 Cash on Delivery' : '✅ CliQ'}
                </span>
              </div>
              <div><strong>Fulfillment Type:</strong> {order.governorate ? '🚚 Home Delivery' : '🏪 Store Pickup'}</div>
              {order.governorate && (
                <>
                  <div><strong>Governorate:</strong> {order.governorate}</div>
                  <div><strong>Address:</strong> {order.address_line}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', margin: 0 }}>
            Order Items
          </h2>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <tr style={{ textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Product</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>Quantity</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No items found for this order.
                    </td>
                  </tr>
                ) : items.map((item, i) => (
                  <tr key={item.id || i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ fontWeight: '500' }}>{item.product?.name_en || 'Unknown Product'}</div>
                      {item.variant && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{item.variant.variant_label}</div>}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>{Number(item.unit_price).toFixed(2)} JOD</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right', fontWeight: '500' }}>{Number(item.line_total).toFixed(2)} JOD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="card" style={{ width: '100%', maxWidth: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal:</span>
              <span>{subtotal.toFixed(2)} JOD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Delivery Fee:</span>
              <span>{Number(order.delivery_fee || 0).toFixed(2)} JOD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', fontWeight: '700', fontSize: '1.125rem' }}>
              <span>Grand Total:</span>
              <span>{Number(order.total).toFixed(2)} JOD</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
