import { FormEvent, useCallback, useMemo, useState } from 'react';
import Header from './components/Header';
import SettingsDrawer from './components/SettingsDrawer';
import ArticlePreview from './components/ArticlePreview';
import WebsiteSelector from './components/WebsiteSelector';
import { useSettings } from './hooks/useSettings';
import { GeneratedArticle, ListicleItem, PushResult } from './types';
import { generateArticle as requestArticle } from './services/geminiService';
import { generateImage } from './services/ideogramService';
import { pushArticleToWordPress } from './services/wordpressService';

function splitIntroduction(introduction: string): string[] {
  return introduction.split('\n');
}

function sanitizeListicle(listicle: ListicleItem[]): ListicleItem[] {
  return listicle.map(item => ({ ...item }));
}

const App = () => {
  const { settings, updateSettings, addWebsite, updateWebsite, removeWebsite, derived } = useSettings();
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [article, setArticle] = useState<GeneratedArticle | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>();
  const [isPublishing, setIsPublishing] = useState(false);
  const [pushResult, setPushResult] = useState<PushResult | undefined>();
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const selectedWebsite = useMemo(
    () => settings.websites.find(website => website.id === selectedWebsiteId),
    [settings.websites, selectedWebsiteId]
  );

  const handleGenerate = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!title.trim()) {
        setError('Please provide an article title.');
        return;
      }
      setError(undefined);
      setStatus(undefined);
      setPushResult(undefined);
      setIsGenerating(true);
      try {
        const generated = await requestArticle(title.trim(), settings.geminiApiKey);
        const featuredImageData = await generateImage({
          prompt: generated.featured_image_prompt,
          apiKey: settings.ideogramApiKey,
          aspectRatio: '4:3'
        });

        const listicleWithImages: ListicleItem[] = [];
        for (const item of generated.listicle) {
          const imageData = await generateImage({
            prompt: item.image_prompt,
            apiKey: settings.ideogramApiKey,
            aspectRatio: item.aspectRatio
          });
          listicleWithImages.push({ ...item, imageData });
        }

        setArticle({
          ...generated,
          introduction: splitIntroduction(generated.introduction).join('\n'),
          listicle: sanitizeListicle(listicleWithImages),
          featuredImageData
        });
        setStatus('Article generated successfully');
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to generate article.');
      } finally {
        setIsGenerating(false);
      }
    },
    [title, settings.geminiApiKey, settings.ideogramApiKey]
  );

  const handleRegenerateImage = useCallback(
    async (index: number) => {
      if (!article) return;
      const item = article.listicle[index];
      if (!item) return;
      setRegeneratingIndex(index);
      setError(undefined);
      try {
        const imageData = await generateImage({
          prompt: item.image_prompt,
          apiKey: settings.ideogramApiKey,
          aspectRatio: item.aspectRatio
        });
        const updatedListicle = article.listicle.map((listItem, listIndex) =>
          listIndex === index ? { ...listItem, imageData } : listItem
        );
        setArticle({ ...article, listicle: updatedListicle });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to regenerate image.');
      } finally {
        setRegeneratingIndex(null);
      }
    },
    [article, settings.ideogramApiKey]
  );

  const handlePublish = useCallback(async () => {
    if (!article) return;
    if (!selectedWebsite) {
      setError('Select a website before publishing.');
      return;
    }
    setError(undefined);
    setStatus(undefined);
    setIsPublishing(true);
    try {
      const result = await pushArticleToWordPress(selectedWebsite, article);
      setPushResult(result);
      setStatus('Draft pushed successfully');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to push article.');
    } finally {
      setIsPublishing(false);
    }
  }, [article, selectedWebsite]);

  return (
    <div className="app-shell">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} lastPushStatus={status} />

      <main className="card" style={{ display: 'grid', gap: '1.5rem' }}>
        <form onSubmit={handleGenerate} style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span>Article title</span>
            <input
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="e.g. 10 Serene Japandi Bedrooms to Inspire Your Remodel"
              required
            />
          </label>

          <div className="grid-two">
            <div>
              <p style={{ margin: 0, color: '#94a3b8' }}>
                Make sure your Gemini and Ideogram API keys are saved in settings.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={isGenerating || !derived.hasCredentials}>
                {isGenerating ? 'Generating…' : 'Generate article'}
              </button>
            </div>
          </div>
        </form>

        {error && <div className="status-message error">{error}</div>}
        {status && !error && <div className="status-message">{status}</div>}

        <section className="listicle-item" style={{ gap: '1rem', background: 'rgba(15,23,42,0.55)' }}>
          <h3 style={{ margin: 0 }}>Publish</h3>
          <p style={{ margin: 0, color: '#94a3b8' }}>
            Uploads all AI images to WordPress first, then assembles a Gutenberg post with Yoast SEO
            metadata populated.
          </p>
          <WebsiteSelector
            websites={settings.websites}
            selectedId={selectedWebsiteId}
            onChange={setSelectedWebsiteId}
          />
          <button
            type="button"
            onClick={handlePublish}
            disabled={!article || isPublishing || !selectedWebsite}
          >
            {isPublishing ? 'Pushing…' : 'Push the article'}
          </button>
          {pushResult?.success && pushResult.url && (
            <a href={pushResult.url} target="_blank" rel="noreferrer">
              View draft
            </a>
          )}
        </section>
      </main>

      <ArticlePreview
        article={article}
        onRegenerateImage={handleRegenerateImage}
        isRegeneratingIndex={regeneratingIndex}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onAddWebsite={addWebsite}
        onUpdateWebsite={updateWebsite}
        onRemoveWebsite={removeWebsite}
      />
    </div>
  );
};

export default App;
