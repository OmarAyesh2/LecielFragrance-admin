import { useState, useEffect, Fragment } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (e, id, currentStatus) => {
    e.stopPropagation(); // Prevent row click
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === id ? { ...msg, is_read: !currentStatus } : msg
        )
      );
    } catch (err) {
      console.error(err);
      addToast('Failed to update message status', 'error');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent row click
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      
      addToast('Message deleted');
      setMessages(prev => prev.filter(m => m.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error(err);
      addToast('Failed to delete message', 'error');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Contact Messages</h2>
      </div>
      
      {loading ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Loading messages...</div>
      ) : messages.length === 0 ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No messages found.</div>
      ) : (
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              <tr style={{ textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Date</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Name</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Email</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Subject</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <Fragment key={msg.id}>
                  <tr 
                    style={{ 
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: msg.is_read ? 'transparent' : 'var(--color-bg-sidebar-hover)',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onClick={() => {
                      toggleExpand(msg.id);
                      if (!msg.is_read) {
                        handleToggleRead({ stopPropagation: () => {} }, msg.id, msg.is_read);
                      }
                    }}
                  >
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)' }}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: msg.is_read ? '400' : '600' }}>
                      {msg.name}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <a href={`mailto:${msg.email}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                        {msg.email}
                      </a>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: msg.is_read ? '400' : '600' }}>
                      {msg.subject}
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '999px', 
                        fontSize: '0.75rem',
                        backgroundColor: msg.is_read ? 'var(--color-bg)' : '#FEF08A',
                        color: msg.is_read ? 'var(--color-text-secondary)' : '#854D0E',
                        border: '1px solid',
                        borderColor: msg.is_read ? 'var(--color-border)' : '#FDE047'
                      }}>
                        {msg.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-ghost" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                          onClick={(e) => handleToggleRead(e, msg.id, msg.is_read)}
                        >
                          Mark {msg.is_read ? 'Unread' : 'Read'}
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                          onClick={(e) => handleDelete(e, msg.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === msg.id && (
                    <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                      <td colSpan="6" style={{ padding: 'var(--space-4)' }}>
                        <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                          <h4 style={{ fontWeight: '600', marginBottom: 'var(--space-2)' }}>Message</h4>
                          <p style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            {msg.message}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
