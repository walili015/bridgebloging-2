import { FC } from 'react';
import { ListicleItem } from '../types';

interface ListicleItemCardProps {
  item: ListicleItem;
  index: number;
  onRegenerateImage: (index: number) => void;
  isRegenerating?: boolean;
}

const ListicleItemCard: FC<ListicleItemCardProps> = ({ item, index, onRegenerateImage, isRegenerating }) => {
  const paragraphs = item.description.split('\n');

  return (
    <article className="listicle-item">
      <div className="badge">#{index + 1}</div>
      <h3 style={{ margin: 0 }}>{item.title}</h3>
      {item.imageData && (
        <img
          src={item.imageData}
          alt={item.title}
          style={{ aspectRatio: item.aspectRatio === '1:1' ? '1 / 1' : '3 / 4' }}
        />
      )}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {paragraphs.map((paragraph, paragraphIndex) => (
          <p key={paragraphIndex} style={{ margin: 0, color: '#cbd5f5', lineHeight: 1.6 }}>
            {paragraph}
          </p>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Aspect ratio: {item.aspectRatio}</p>
        <button onClick={() => onRegenerateImage(index)} disabled={isRegenerating}>
          {isRegenerating ? 'Regenerating…' : 'Regenerate Image'}
        </button>
      </div>
    </article>
  );
};

export default ListicleItemCard;
