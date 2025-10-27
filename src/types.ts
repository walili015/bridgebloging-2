export interface ListicleItem {
  title: string;
  description: string;
  image_prompt: string;
  aspectRatio: '1:1' | '3:4';
  imageData?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GeneratedArticle {
  introduction: string;
  featured_image_prompt: string;
  listicle: ListicleItem[];
  faq: FAQItem[];
  conclusion: string;
  slug: string;
  focus_keyphrase: string;
  meta_description: string;
  featuredImageData?: string;
}

export interface WebsiteCredential {
  id: string;
  name: string;
  url: string;
  username: string;
  applicationPassword: string;
}

export interface SettingsState {
  geminiApiKey: string;
  ideogramApiKey: string;
  websites: WebsiteCredential[];
}

export interface PushResult {
  success: boolean;
  url?: string;
  message?: string;
}
