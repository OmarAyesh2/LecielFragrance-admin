export default function InvoicePrint({ order, items, customerName, settings }) {
  if (!order) return null;

  const isCOD = order.payment_method?.toLowerCase() === 'cod';

  return (
    <div className="invoice-print-container" style={{ display: 'none', padding: '20px', fontFamily: 'sans-serif', color: '#000' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
        <div>
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
          ) : (
            <h1 style={{ margin: 0, fontSize: '24px' }}>Leciel Fragrance</h1>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>INVOICE</h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px' }}><strong>Order #:</strong> {order.order_number || order.id.substring(0,8).toUpperCase()}</p>
          <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
            <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '14px', textTransform: 'uppercase' }}>Bill To</h3>
        <p style={{ margin: 0 }}><strong>{customerName}</strong></p>
        <p style={{ margin: '4px 0 0' }}>{order.guest_phone || 'No phone provided'}</p>
        <p style={{ margin: '4px 0 0' }}>{order.address_line || 'No address line'}</p>
        <p style={{ margin: '4px 0 0' }}>{order.governorate || 'No governorate'}</p>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px 0', textAlign: 'left' }}>Item</th>
            <th style={{ padding: '8px 0', textAlign: 'center' }}>Qty</th>
            <th style={{ padding: '8px 0', textAlign: 'right' }}>Price</th>
            <th style={{ padding: '8px 0', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px 0' }}>
                {item.product?.name_en || 'Unknown Product'}
                {item.variant && <div style={{ fontSize: '12px', color: '#555' }}>{item.variant.variant_label}</div>}
              </td>
              <td style={{ padding: '8px 0', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>{Number(item.unit_price).toFixed(2)} JOD</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>{Number(item.line_total).toFixed(2)} JOD</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        <table style={{ width: '250px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>Subtotal:</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{(Number(order.total) - Number(order.delivery_fee || 0)).toFixed(2)} JOD</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>Delivery:</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{Number(order.delivery_fee || 0).toFixed(2)} JOD</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', borderTop: '2px solid #000' }}>Grand Total:</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', borderTop: '2px solid #000' }}>{Number(order.total).toFixed(2)} JOD</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Flag */}
      {isCOD ? (
        <div style={{ border: '2px dashed #000', padding: '15px', textAlign: 'center', marginBottom: '30px', fontWeight: 'bold', fontSize: '16px' }}>
          Cash on Delivery — Collect: {Number(order.total).toFixed(2)} JOD
        </div>
      ) : (
        <div style={{ border: '2px solid #10B981', color: '#10B981', padding: '15px', textAlign: 'center', marginBottom: '30px', fontWeight: 'bold', fontSize: '16px' }}>
          CliQ — Prepaid / Verified
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', color: '#555', fontSize: '12px', marginTop: '40px' }}>
        <p style={{ margin: 0 }}>Thank you for your purchase!</p>
        <p style={{ margin: '4px 0 0' }}>{settings?.email || 'N/A'} {settings?.address_en ? `| ${settings.address_en}` : ''}</p>
      </div>

    </div>
  );
}
