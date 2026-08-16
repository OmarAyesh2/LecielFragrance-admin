import os

base_dir = r"c:\Users\oayes\Documents\GitHub\Leciel Fragrance\apps\storefront\src"
co_path = os.path.join(base_dir, "components", "checkout", "CheckoutClient.js")

with open(co_path, "r", encoding="utf-8") as f:
    co_content = f.read()

# The target block looks like this:
#                 {settings?.cliq_enabled && (
#                   <label className="radio-label">
#                     <input 
#                       type="radio" 
#                       name="payment" 
#                       value="cliq" 
#                       checked={payment === 'cliq'}
#                       onChange={() => setPayment('cliq')}
#                     />
#                     <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> CliQ</span>
#                   </label>
#                   {payment === 'cliq' && <div style={{marginTop: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--color-text-secondary)'}}>Transfer to Alias: {settings?.cliq_alias}</div>}
#                 )}

original_block = """                {settings?.cliq_enabled && (
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cliq" 
                      checked={payment === 'cliq'}
                      onChange={() => setPayment('cliq')}
                    />
                    <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> CliQ</span>
                  </label>
                  {payment === 'cliq' && <div style={{marginTop: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--color-text-secondary)'}}>Transfer to Alias: {settings?.cliq_alias}</div>}
                )}"""

new_block = """                {settings?.cliq_enabled && (
                  <>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="cliq" 
                        checked={payment === 'cliq'}
                        onChange={() => setPayment('cliq')}
                      />
                      <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> CliQ</span>
                    </label>
                    {payment === 'cliq' && <div style={{marginTop: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--color-text-secondary)'}}>Transfer to Alias: {settings?.cliq_alias}</div>}
                  </>
                )}"""

co_content = co_content.replace(original_block, new_block)

with open(co_path, "w", encoding="utf-8") as f:
    f.write(co_content)

print("Fragment wrappers added successfully.")
