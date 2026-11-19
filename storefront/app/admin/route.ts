import adminHtml from '../../data/admin-html';
import {isAdmin,htmlResponse} from '../../lib/store-server';
import {headers} from 'next/headers';
export const dynamic='force-dynamic';
export async function GET(request:Request){if(!await isAdmin()){const h=await headers();if(!h.get('oai-authenticated-user-id'))return Response.redirect(new URL('/signin-with-chatgpt?return_to=%2Fadmin',request.url));return new Response('This area is restricted to the store owner.',{status:403,headers:{'Cache-Control':'no-store'}})}return htmlResponse(adminHtml)}

