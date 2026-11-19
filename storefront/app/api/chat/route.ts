import { env } from 'cloudflare:workers';
import { publicRateLimit } from '../../../lib/public-rate-limit';
import { readJson, requestErrorResponse } from '../../../lib/request-security';
import { isAdmin, json, sameOrigin } from '../../../lib/store-server';

export const dynamic = 'force-dynamic';

const model = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'Invalid request origin' }, 403);
  if (!await isAdmin()) return json({ error: 'Owner sign-in required' }, 403);

  let input: Record<string, unknown>;
  try {
    input = await readJson(req, 4096);
  } catch (error) {
    return requestErrorResponse(error);
  }

  const message = typeof input.message === 'string' ? input.message.trim() : '';
  if (!message || message.length > 1000 || Object.keys(input).length !== 1) {
    return json({ error: 'Send one message of up to 1,000 characters.' }, 400);
  }

  const ai = env.AI;
  if (!ai) return json({ error: 'Chat is unavailable.' }, 503);

  try {
    const limited = await publicRateLimit(req, 'owner-chat-minute', 4, 60, true)
      ?? await publicRateLimit(req, 'owner-chat-day', 40, 86400, true);
    if (limited) return limited;

    const result = await ai.run(model, {
      messages: [{ role: 'user', content: message }],
      max_tokens: 256,
      stream: false,
    });
    const response = result && typeof result === 'object' && 'response' in result ? result.response : result;
    const reply = typeof response === 'string' ? response.trim() : '';
    if (reply) return json({ reply });
  } catch {
    // Provider errors can contain internal details.
  }
  return json({ error: 'Chat could not respond. Try again later.' }, 502);
}
