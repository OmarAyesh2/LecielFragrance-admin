import { Link } from 'react-router-dom';
import ProductTable from '../components/products/ProductTable';

export default function Products() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link to="/products/new" className="btn btn-primary">
          + Add Product
        </Link>
      </div>
      
      <ProductTable />
    </div>
  );
}
