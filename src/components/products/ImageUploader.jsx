import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

export default function ImageUploader({ value, onChange, folder = 'product-images' }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const extractFileName = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const deleteFromStorage = async (url) => {
    const fileName = extractFileName(url);
    if (!fileName) return;
    try {
      const { error } = await supabase.storage.from(folder).remove([fileName]);
      if (error) console.error('Failed to delete from storage:', error);
    } catch (err) {
      console.error('Storage deletion error:', err);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    
    // Validate type and size
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast('Invalid file type. Only JPG, PNG, WEBP allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('File too large. Max 5MB.', 'error');
      return;
    }

    try {
      setUploading(true);
      
      // If replacing an existing image, delete the old one first
      if (value) {
        await deleteFromStorage(value);
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(folder)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(folder).getPublicUrl(filePath);
      
      onChange(data.publicUrl);
      addToast('Image uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      addToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async () => {
    if (value) {
      setUploading(true);
      await deleteFromStorage(value);
      addToast('Image deleted from storage');
      setUploading(false);
    }
    onChange('');
  };

  return (
    <div style={{ width: '100%' }}>
      {value ? (
        <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
               onMouseEnter={e => e.currentTarget.style.opacity = 1}
               onMouseLeave={e => e.currentTarget.style.opacity = 0}>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn" style={{ backgroundColor: 'white', marginRight: '4px' }}>Change</button>
            <button type="button" onClick={handleRemove} className="btn btn-danger">Remove</button>
          </div>
        </div>
      ) : (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-8)',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'var(--color-bg)',
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
        >
          {uploading ? (
            <div style={{ color: 'var(--color-text-secondary)' }}>Uploading...</div>
          ) : (
            <>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📸</div>
              <div style={{ fontWeight: '500' }}>Click or drag to upload</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>JPG, PNG, WEBP (Max 5MB)</div>
            </>
          )}
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])} 
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }} 
      />
    </div>
  );
}
