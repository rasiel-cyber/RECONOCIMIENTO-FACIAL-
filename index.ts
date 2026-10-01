import { config as loadEnv } from 'dotenv';
import { higgsfield } from '@higgsfield/client/v2';

loadEnv({ path: '.env.local', quiet: true });

if (!process.env.HF_CREDENTIALS) {
  console.error('Missing HF_CREDENTIALS. Add it to .env.local as key-id:key-secret.');
  process.exit(1);
}

const ENDPOINT = 'bytedance/seedance-2.5/text-to-video';

async function main(): Promise<void> {
  const result = await higgsfield.subscribe(ENDPOINT, {
    input: {
      prompt: 'A cinematic scene at sunset',
      duration: 5,
      resolution: '720p',
      aspect_ratio: '16:9',
    },
    withPolling: true,
  });

  console.log(`Request ${result.request_id} finished with status: ${result.status}`);

  if (result.status === 'completed') {
    const url = result.video?.url;
    if (!url) {
      console.error('Completed but the response has no video URL.');
      process.exit(1);
    }
    console.log('Video URL:', url);
    return;
  }

  if (result.status === 'nsfw') console.error('Blocked by moderation (nsfw). No video generated.');
  else if (result.status === 'failed') console.error('Generation failed. No video generated.');
  else console.error(`Not completed (status: ${result.status}). No video generated.`);
  process.exit(1);
}

main().catch((err: unknown) => {
  console.error('Higgsfield request error:', err instanceof Error ? err.message : 'unknown error');
  process.exit(1);
});
