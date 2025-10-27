import { FC } from 'react';
import { FAQItem as FAQItemType } from '../types';

interface FAQItemProps {
  item: FAQItemType;
}

const FaqItem: FC<FAQItemProps> = ({ item }) => {
  return (
    <div className="listicle-item" style={{ background: 'rgba(15, 23, 42, 0.65)' }}>
      <h4 style={{ margin: 0 }}>{item.question}</h4>
      {item.answer.split('\n').map((paragraph, index) => (
        <p key={index} style={{ margin: 0, color: '#cbd5f5', lineHeight: 1.6 }}>
          {paragraph}
        </p>
      ))}
    </div>
  );
};

export default FaqItem;
