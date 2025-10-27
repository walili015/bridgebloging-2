import { GeneratedArticle, ListicleItem } from '../types';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const SYSTEM_INSTRUCTIONS = `You write long-form listicle articles for a premium home decor blog. Return a strict JSON response that follows the schema given. Do not include markdown fences or extra commentary.`;

function assignAspectRatios(items: ListicleItem[]): ListicleItem[] {
  return items.map((item, index) => ({
    ...item,
    aspectRatio: index % 2 === 0 ? '1:1' : '3:4'
  }));
}

export async function generateArticle(
  title: string,
  apiKey: string
): Promise<GeneratedArticle> {
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Add it in settings first.');
  }

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${SYSTEM_INSTRUCTIONS}\nTitle: ${title}\n\nReturn the JSON object described in the instructions. Ensure descriptions mention home decor details and respect word limits. Avoid human figures in imagery.`
          }
        ]
      }
    ]
  };

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} ${error.error?.message ?? ''}`);
  }

  const data = await response.json();
  const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned an unexpected response.');
  }

  try {
    const parsed = JSON.parse(rawText) as GeneratedArticle;
    return {
      ...parsed,
      listicle: assignAspectRatios(parsed.listicle)
    };
  } catch (error) {
    console.error('Failed to parse Gemini response', rawText);
    throw new Error('Gemini response could not be parsed. Ensure the prompt instructions are satisfied.');
  }
}
