import script from 'virtual:store-admin-script';
import {isAdmin} from '../../../lib/store-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = {
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
  if (!await isAdmin()) return new Response('Owner sign-in required', {status: 403, headers});
  return new Response(script, {headers: {...headers, 'Content-Type': 'application/javascript; charset=utf-8'}});
}
