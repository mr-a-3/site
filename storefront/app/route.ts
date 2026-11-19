import html from '../data/storefront-html';
import {getSettings, htmlResponse} from '../lib/store-server';
export const dynamic='force-dynamic';
export async function GET() {
  const {config} = await getSettings();
  const {brand, currency, categories, texts, contacts, layout, promotion, products, delivery} = config;
  const publicWallet = ({enabled, number, accountType}: typeof delivery.bkash) =>
    enabled ? {enabled, number, accountType} : {enabled: false};
  const data = {
    brand, currency, categories, texts, contacts, layout, promotion,
    products: products.map(({weightKg, ...product}) => product),
    delivery: {
      cod: delivery.cod,
      disabledDistricts: delivery.disabledDistricts,
      bkash: publicWallet(delivery.bkash),
      nagad: publicWallet(delivery.nagad),
    },
  };
  const serialized = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return htmlResponse(html.replace('<script src="/storefront.js"', `<script>window.STORE_DATA=${serialized}</script><script src="/storefront.js"`));
}
