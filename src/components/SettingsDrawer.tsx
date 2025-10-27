import { FC, FormEvent, useMemo, useState } from 'react';
import { SettingsState, WebsiteCredential } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsState;
  onUpdateSettings: (settings: Partial<SettingsState>) => void;
  onAddWebsite: (website: Omit<WebsiteCredential, 'id'>) => void;
  onUpdateWebsite: (id: string, website: Partial<WebsiteCredential>) => void;
  onRemoveWebsite: (id: string) => void;
}

const SettingsDrawer: FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onAddWebsite,
  onUpdateWebsite,
  onRemoveWebsite
}) => {
  const [newWebsite, setNewWebsite] = useState({
    name: '',
    url: '',
    username: '',
    applicationPassword: ''
  });

  const canSaveWebsite = useMemo(() => {
    return Object.values(newWebsite).every(Boolean);
  }, [newWebsite]);

  const handleAddWebsite = (event: FormEvent) => {
    event.preventDefault();
    if (!canSaveWebsite) return;
    onAddWebsite(newWebsite);
    setNewWebsite({ name: '', url: '', username: '', applicationPassword: '' });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(16px)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '4rem 1.5rem'
      }}
    >
      <div className="card" style={{ maxWidth: '840px', width: '100%', position: 'relative' }}>
        <div className="flex-between">
          <div>
            <h2>Workspace Settings</h2>
            <p style={{ marginTop: '0.75rem', maxWidth: '520px', color: '#cbd5f5' }}>
              Securely store your Gemini, Ideogram, and WordPress credentials. Everything is saved to
              your local browser storage only.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(100,116,139,0.35)' }}>
            Close
          </button>
        </div>

        <section style={{ marginTop: '2rem' }}>
          <h3 className="section-title">API Keys</h3>
          <div className="grid-two">
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              <span>Gemini API Key</span>
              <input
                type="password"
                placeholder="Paste your Gemini API Key"
                value={settings.geminiApiKey}
                onChange={event => onUpdateSettings({ geminiApiKey: event.target.value })}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              <span>Ideogram API Key</span>
              <input
                type="password"
                placeholder="Paste your Ideogram API Key"
                value={settings.ideogramApiKey}
                onChange={event => onUpdateSettings({ ideogramApiKey: event.target.value })}
              />
            </label>
          </div>
        </section>

        <section style={{ marginTop: '2.5rem' }}>
          <h3 className="section-title">WordPress Websites</h3>
          <p style={{ marginTop: '0.25rem', color: '#cbd5f5' }}>
            Add each WordPress site using an application password generated from your profile. Drafts
            are created with Yoast SEO data pre-filled.
          </p>

          {settings.websites.length > 0 ? (
            <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
              {settings.websites.map(site => (
                <div key={site.id} className="listicle-item" style={{ gap: '0.75rem' }}>
                  <div className="flex-between">
                    <div>
                      <h4 style={{ margin: 0 }}>{site.name}</h4>
                      <p style={{ margin: '0.35rem 0', color: '#93c5fd' }}>{site.url}</p>
                    </div>
                    <button
                      onClick={() => onRemoveWebsite(site.id)}
                      style={{ background: 'rgba(248,113,113,0.25)' }}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid-two">
                    <label style={{ display: 'grid', gap: '0.35rem' }}>
                      <span>Username</span>
                      <input
                        value={site.username}
                        onChange={event => onUpdateWebsite(site.id, { username: event.target.value })}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '0.35rem' }}>
                      <span>Application Password</span>
                      <input
                        type="password"
                        value={site.applicationPassword}
                        onChange={event =>
                          onUpdateWebsite(site.id, { applicationPassword: event.target.value })
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: '1.5rem', color: '#e2e8f0' }}>
              No websites yet. Add your first connection below.
            </p>
          )}

          <form onSubmit={handleAddWebsite} style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
            <h4 style={{ margin: 0 }}>Add a new website</h4>
            <div className="grid-two">
              <label style={{ display: 'grid', gap: '0.35rem' }}>
                <span>Website Name</span>
                <input
                  value={newWebsite.name}
                  onChange={event => setNewWebsite(prev => ({ ...prev, name: event.target.value }))}
                  placeholder="e.g. Bridge Blogging"
                  required
                />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem' }}>
                <span>Website URL</span>
                <input
                  value={newWebsite.url}
                  onChange={event => setNewWebsite(prev => ({ ...prev, url: event.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </label>
            </div>
            <div className="grid-two">
              <label style={{ display: 'grid', gap: '0.35rem' }}>
                <span>Author Username</span>
                <input
                  value={newWebsite.username}
                  onChange={event =>
                    setNewWebsite(prev => ({ ...prev, username: event.target.value }))
                  }
                  required
                />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem' }}>
                <span>Application Password</span>
                <input
                  type="password"
                  value={newWebsite.applicationPassword}
                  onChange={event =>
                    setNewWebsite(prev => ({ ...prev, applicationPassword: event.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <button type="submit" disabled={!canSaveWebsite}>
              Save Website
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default SettingsDrawer;
