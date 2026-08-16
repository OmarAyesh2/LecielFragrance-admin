import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useMemo } from 'react';

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    },
    { 
      name: 'Products', 
      path: '/products', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
    },
    { 
      name: 'Categories', 
      path: '/categories', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
    },
    { 
      name: 'Orders', 
      path: '/orders', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
    },
    { 
      name: 'Reviews', 
      path: '/reviews', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    },
    { 
      name: 'Messages', 
      path: '/messages', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-2.82.33 1.65 1.65 0 0 1-1.92 1.12 2 2 0 0 1-1.42-1.42 1.65 1.65 0 0 0-1.12-1.92 1.65 1.65 0 0 1-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-2.82 1.65 1.65 0 0 1-1.12-1.92 2 2 0 0 1 1.42-1.42 1.65 1.65 0 0 0 1.92-1.12 1.65 1.65 0 0 1 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 2.82-.33 1.65 1.65 0 0 1 1.92-1.12 2 2 0 0 1 1.42 1.42 1.65 1.65 0 0 0 1.12 1.92 1.65 1.65 0 0 1 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 2.82z"></path></svg>
    },
  ];

  const pageTitle = useMemo(() => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/products/new')) return 'New Product';
    if (location.pathname.startsWith('/products/') && location.pathname !== '/products') return 'Edit Product';
    if (location.pathname.startsWith('/products')) return 'Products';
    if (location.pathname.startsWith('/categories')) return 'Categories';
    if (location.pathname.startsWith('/orders/') && location.pathname !== '/orders') return 'Order Detail';
    if (location.pathname.startsWith('/orders')) return 'Orders';
    if (location.pathname.startsWith('/reviews')) return 'Reviews';
    if (location.pathname.startsWith('/messages')) return 'Messages';
    if (location.pathname.startsWith('/settings')) return 'Settings';
    return '';
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{
          padding: 'var(--space-6) var(--space-4)',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: 'var(--color-text-sidebar-active)',
          borderBottom: '1px solid var(--color-bg-sidebar-hover)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Leciel Admin</span>
          <button className="menu-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        
        <nav style={{ flex: 1, padding: 'var(--space-4) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-3) var(--space-6)',
                color: isActive ? 'var(--color-text-sidebar-active)' : 'var(--color-text-sidebar)',
                backgroundColor: isActive ? 'var(--color-bg-sidebar-hover)' : 'transparent',
                borderLeft: isActive ? '4px solid var(--color-accent)' : '4px solid transparent',
                textDecoration: 'none',
                fontWeight: isActive ? '600' : '400',
                transition: 'all var(--transition-fast)'
              })}
            >
              <span style={{ marginRight: 'var(--space-3)' }}>{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
            {pageTitle}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {user?.email}
            </div>
            <button 
              onClick={handleSignOut}
              className="btn btn-ghost"
              style={{ fontSize: '0.875rem' }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
