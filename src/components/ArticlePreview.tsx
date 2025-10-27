import { FC } from 'react';
import { GeneratedArticle } from '../types';
import ListicleItemCard from './ListicleItemCard';
import FaqItem from './FaqItem';

interface ArticlePreviewProps {
  article?: GeneratedArticle;
  onRegenerateImage: (index: number) => void;
  isRegeneratingIndex?: number | null;
}

const ArticlePreview: FC<ArticlePreviewProps> = ({ article, onRegenerateImage, isRegeneratingIndex }) => {
  if (!article) {
    return (
      <div className="card">
        <h2>Generated article preview</h2>
        <p style={{ marginTop: '0.75rem', color: '#cbd5f5' }}>
          Provide a title and click “Generate article” to build a fresh listicle complete with images
          and SEO metadata.
        </p>
      </div>
    );
  }

  const introductionParagraphs = article.introduction.split('\n');
  const conclusionParagraphs = article.conclusion.split('\n');

  return (
    <section className="card" style={{ display: 'grid', gap: '2rem' }}>
      <div>
        <h2 style={{ marginBottom: '0.5rem' }}>Introduction</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {introductionParagraphs.map((paragraph, index) => (
            <p key={index} style={{ margin: 0, color: '#cbd5f5', lineHeight: 1.6 }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {article.featuredImageData && (
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Featured image (4:3)</h3>
          <img
            src={article.featuredImageData}
            alt={article.slug}
            style={{ width: '100%', borderRadius: '1rem', aspectRatio: '4 / 3', objectFit: 'cover' }}
          />
          <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            Prompt: {article.featured_image_prompt}
          </p>
        </div>
      )}

      <div>
        <h2 style={{ marginBottom: '1rem' }}>Listicle</h2>
        <div className="grid-two">
          {article.listicle.map((item, index) => (
            <ListicleItemCard
              key={item.title}
              item={item}
              index={index}
              onRegenerateImage={onRegenerateImage}
              isRegenerating={isRegeneratingIndex === index}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: '1rem' }}>Frequently Asked Questions</h2>
        <div className="grid-two">
          {article.faq.map(item => (
            <FaqItem key={item.question} item={item} />
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: '0.5rem' }}>Conclusion</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {conclusionParagraphs.map((paragraph, index) => (
            <p key={index} style={{ margin: 0, color: '#cbd5f5', lineHeight: 1.6 }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="listicle-item" style={{ gap: '0.5rem', background: 'rgba(15,23,42,0.6)' }}>
        <h3 style={{ margin: 0 }}>SEO summary</h3>
        <p style={{ margin: 0 }}>Slug: {article.slug}</p>
        <p style={{ margin: 0 }}>Focus keyphrase: {article.focus_keyphrase}</p>
        <p style={{ margin: 0 }}>Meta description: {article.meta_description}</p>
      </div>
    </section>
  );
};

export default ArticlePreview;
