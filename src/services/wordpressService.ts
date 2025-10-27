import { GeneratedArticle, ListicleItem, PushResult, WebsiteCredential } from '../types';

interface UploadResult {
  id: number;
  url: string;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64Data] = dataUrl.split(',');
  const mimeMatch = meta.match(/data:(.*);base64/);
  const mime = mimeMatch?.[1] ?? 'image/jpeg';
  const binary = atob(base64Data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

async function uploadImage(
  website: WebsiteCredential,
  dataUrl: string,
  fileName: string
): Promise<UploadResult> {
  const blob = dataUrlToBlob(dataUrl);
  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + btoa(`${website.username}:${website.applicationPassword}`));
  headers.append('Content-Disposition', `attachment; filename="${fileName}"`);

  const response = await fetch(`${website.url.replace(/\/$/, '')}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers,
    body: blob
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Failed to upload image: ${response.status} ${response.statusText} ${message}`);
  }

  const json = await response.json();
  return {
    id: json.id,
    url: json.source_url
  };
}

function buildListicleBlocks(listicle: ListicleItem[], uploads: UploadResult[]): string {
  return listicle
    .map((item, index) => {
      const upload = uploads[index];
      return `
<!-- wp:heading -->
<h2>#${index + 1} ${item.title}</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>${item.description.split('\n').join('</p><p>')}</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":${upload.id},"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="${upload.url}" alt="${item.title}" /></figure>
<!-- /wp:image -->
`;
    })
    .join('\n');
}

function buildFaqBlocks(faq: GeneratedArticle['faq']): string {
  return faq
    .map(item => {
      return `
<!-- wp:heading {"level":3} -->
<h3>${item.question}</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>${item.answer.split('\n').join('</p><p>')}</p>
<!-- /wp:paragraph -->
`;
    })
    .join('\n');
}

function buildContent(
  article: GeneratedArticle,
  listicleUploads: UploadResult[],
  featuredImage: UploadResult
): string {
  const introBlocks = article.introduction
    .split('\n')
    .map(paragraph => `<!-- wp:paragraph --><p>${paragraph}</p><!-- /wp:paragraph -->`)
    .join('\n');

  const conclusionBlocks = article.conclusion
    .split('\n')
    .map(paragraph => `<!-- wp:paragraph --><p>${paragraph}</p><!-- /wp:paragraph -->`)
    .join('\n');

  const listicleBlocks = buildListicleBlocks(article.listicle, listicleUploads);
  const faqBlocks = buildFaqBlocks(article.faq);

  return `<!-- wp:paragraph -->
<p>${new Date().toLocaleDateString()}</p>
<!-- /wp:paragraph -->

${introBlocks}

<!-- wp:image {"id":${featuredImage.id},"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="${featuredImage.url}" alt="${article.slug}" /></figure>
<!-- /wp:image -->

${listicleBlocks}

<!-- wp:heading -->
<h2>Frequently Asked Questions</h2>
<!-- /wp:heading -->

${faqBlocks}

<!-- wp:heading -->
<h2>Conclusion</h2>
<!-- /wp:heading -->

${conclusionBlocks}`;
}

export async function pushArticleToWordPress(
  website: WebsiteCredential,
  article: GeneratedArticle
): Promise<PushResult> {
  if (!website) {
    throw new Error('Please select a website to publish to.');
  }
  if (!article.featuredImageData) {
    throw new Error('Featured image missing. Regenerate the article before publishing.');
  }
  if (article.listicle.some(item => !item.imageData)) {
    throw new Error('One or more listicle items are missing images.');
  }

  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + btoa(`${website.username}:${website.applicationPassword}`));
  headers.append('Content-Type', 'application/json');

  const featuredUpload = await uploadImage(website, article.featuredImageData, `${article.slug}-featured.jpg`);
  const listicleUploads = await Promise.all(
    article.listicle.map((item, index) =>
      uploadImage(website, item.imageData!, `${article.slug}-item-${index + 1}.jpg`)
    )
  );

  const content = buildContent(article, listicleUploads, featuredUpload);

  const body = {
    title: article.slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    slug: article.slug,
    status: 'draft',
    content,
    featured_media: featuredUpload.id,
    meta: {
      yoast_wpseo_focuskw: article.focus_keyphrase,
      yoast_wpseo_metadesc: article.meta_description
    }
  };

  const response = await fetch(`${website.url.replace(/\/$/, '')}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create post draft: ${response.status} ${response.statusText} ${text}`);
  }

  const json = await response.json();
  return {
    success: true,
    url: json.link,
    message: 'Draft created successfully.'
  };
}
