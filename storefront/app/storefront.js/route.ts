import script from 'virtual:storefront-script';

export function GET() {
  return new Response(script, {headers: {
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  }});
}
