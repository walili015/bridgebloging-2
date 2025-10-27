const IDEOGRAM_ENDPOINT = 'https://api.ideogram.ai/generate';

interface GenerateImageOptions {
  prompt: string;
  apiKey: string;
  aspectRatio: '1:1' | '3:4' | '4:3';
}

const ratioToSize: Record<'1:1' | '3:4' | '4:3', { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '3:4': { width: 960, height: 1280 },
  '4:3': { width: 1280, height: 960 }
};

export async function generateImage({ prompt, apiKey, aspectRatio }: GenerateImageOptions): Promise<string> {
  if (!apiKey) {
    throw new Error('Ideogram API key is missing. Add it in settings first.');
  }

  const size = ratioToSize[aspectRatio];

  const response = await fetch(IDEOGRAM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: 'people, person, human, portrait, face, selfie',
      width: size.width,
      height: size.height,
      style: 'photorealistic'
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Ideogram API error: ${response.status} ${response.statusText} ${error.error ?? ''}`);
  }

  const payload = await response.json();

  const imageBase64: string | undefined = payload?.data?.[0]?.b64_json ?? payload?.image_base64;
  if (!imageBase64) {
    throw new Error('Ideogram API returned an unexpected response.');
  }

  return `data:image/jpeg;base64,${imageBase64}`;
}
