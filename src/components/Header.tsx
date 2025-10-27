import { FC } from 'react';

interface HeaderProps {
  onOpenSettings: () => void;
  lastPushStatus?: string;
}

const Header: FC<HeaderProps> = ({ onOpenSettings, lastPushStatus }) => {
  return (
    <header className="card" style={{ position: 'sticky', top: '1.5rem', zIndex: 10 }}>
      <div className="flex-between">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem' }}>Bridge Blogging Studio</h1>
          <p style={{ marginTop: '0.5rem', color: '#cbd5f5', maxWidth: '640px' }}>
            Generate beautifully structured home decor listicles with AI-crafted imagery and publish
            them to any of your connected WordPress sites in just a few clicks.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onOpenSettings}>Open Settings</button>
          {lastPushStatus && <span className="badge">{lastPushStatus}</span>}
        </div>
      </div>
    </header>
  );
};

export default Header;
