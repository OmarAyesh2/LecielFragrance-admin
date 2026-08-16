export default function OrderStatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase() || 'unknown';
  let colorClass = '';
  
  switch (normalizedStatus) {
    case 'pending': colorClass = 'badge-warning'; break; // Default warning styling is yellowish/orange
    case 'confirmed': colorClass = 'badge-info'; break; // Info is blue
    case 'processing': colorClass = 'badge-accent'; break; // Custom accent/indigo
    case 'shipped': colorClass = 'badge-purple'; break;
    case 'delivered': colorClass = 'badge-success'; break; // Green
    case 'cancelled': colorClass = 'badge-danger'; break; // Red
    default: colorClass = 'badge-secondary';
  }

  // Adding inline overrides for the ones we don't have utility classes for yet,
  // or we could just use inline styles for all to be safe and match the spec.
  const styleOverrides = {};
  if (normalizedStatus === 'processing') {
    styleOverrides.backgroundColor = 'rgba(99, 102, 241, 0.1)';
    styleOverrides.color = '#6366F1'; // Indigo
  } else if (normalizedStatus === 'shipped') {
    styleOverrides.backgroundColor = 'rgba(168, 85, 247, 0.1)';
    styleOverrides.color = '#A855F7'; // Purple
  } else if (normalizedStatus === 'confirmed') {
    styleOverrides.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    styleOverrides.color = '#3B82F6'; // Blue
  } else if (normalizedStatus === 'pending') {
    styleOverrides.backgroundColor = 'rgba(245, 158, 11, 0.1)';
    styleOverrides.color = '#F59E0B'; // Yellow/Orange
  } else if (normalizedStatus === 'delivered') {
    styleOverrides.backgroundColor = 'rgba(16, 185, 129, 0.1)';
    styleOverrides.color = '#10B981'; // Green
  } else if (normalizedStatus === 'cancelled') {
    styleOverrides.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    styleOverrides.color = '#EF4444'; // Red
  }

  return (
    <span className={`badge ${colorClass}`} style={styleOverrides}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
}
