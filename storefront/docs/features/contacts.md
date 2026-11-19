# Contacts

Scope: phones, WhatsApp, Facebook, Instagram, contact section.

- `client/experience.js`: social links, phone cards, floating WhatsApp button.
- `public/contact.css`: contact layout and responsive styles.
- `client/admin.js`: Contacts section inputs.
- `lib/store-config.ts`: phone and allowed social URL validation.
- `data/storefront-html.ts`: Contact us navigation and footer anchor.
- `client/content.js`: saved email/address rendering.

Saved fields: `contacts.phone`, `phone2`, `whatsapp`, `facebook`, `instagram`, `email`, `address`, `mapUrl`.
Admin Contact & social has Store address and a Google Maps / OpenStreetMap link. Location opens the saved HTTPS map link, or searches Google Maps for the saved address when the link is empty. With neither set, it reports location unavailable. It never requests customer GPS access. Map links accept only the explicitly allowed Google Maps and OpenStreetMap hosts.
On phones, contact numbers use compact 52px rows and social/location actions use two columns. Desktop actions use four columns.
The saved footer address has a decorative gradient pin (`public/location-pin.svg`) before its text. Address text remains editable in Contact & social and is rendered with textContent.
Two phone numbers and one separate WhatsApp number are editable. Empty social fields show unavailable states. Phone links use `tel:`; WhatsApp uses digits in `https://wa.me/`; social links require allowed HTTPS hosts.
Do not replace saved contacts with placeholders. The current brand and contact details can change through admin.

Check: both phones, separate WhatsApp, empty values, link destinations, mobile footer and floating-button overlap.
Both WhatsApp placements share the same filled 24px-viewBox logo in experience.js. The whatsapp-logo class explicitly disables inherited strokes, preserving the handset and chat-bubble silhouette at contact and floating-button sizes.
