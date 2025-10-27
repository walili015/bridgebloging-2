import { FC } from 'react';
import { WebsiteCredential } from '../types';

interface WebsiteSelectorProps {
  websites: WebsiteCredential[];
  selectedId?: string;
  onChange: (id: string) => void;
}

const WebsiteSelector: FC<WebsiteSelectorProps> = ({ websites, selectedId, onChange }) => {
  if (!websites.length) {
    return <p style={{ color: '#fca5a5' }}>Add a website in settings to enable publishing.</p>;
  }

  return (
    <label style={{ display: 'grid', gap: '0.5rem', width: '100%' }}>
      <span style={{ color: '#cbd5f5' }}>Select website</span>
      <select value={selectedId ?? ''} onChange={event => onChange(event.target.value)}>
        <option value="" disabled>
          Choose a destination…
        </option>
        {websites.map(website => (
          <option key={website.id} value={website.id}>
            {website.name} ({website.url})
          </option>
        ))}
      </select>
    </label>
  );
};

export default WebsiteSelector;
