(() => {
const c=window.STORE_DATA;if(!c)return;
document.title=c.brand+' — Store';
const selectors={announcement:'.announcement > span:nth-child(2)',heroEyebrow:'.hero-copy .eyebrow',heroDescription:'.hero-copy > p',heroNote:'.hero-note',collectionEyebrow:'.section-heading .eyebrow',collectionTitle:'#collection-title',collectionNote:'.section-heading > p',collectionFooter:'.collection-footnote',storyEyebrow:'.story-copy .eyebrow',storyTitle:'.story-copy h2',storyDescription:'.story-copy > p',storyImageLabel:'.image-tag',newsletterEyebrow:'.newsletter .eyebrow',newsletterTitle:'.newsletter h2',navShop:'.desktop-nav a:nth-child(1)',navLiving:'.desktop-nav a:nth-child(2)',navEveryday:'.desktop-nav a:nth-child(3)',valueOne:'.value-strip > span:nth-child(1)',valueTwo:'.value-strip > span:nth-child(2)',valueThree:'.value-strip > span:nth-child(3)',valueFour:'.value-strip > span:nth-child(4)',footerCopyright:'.footer-bottom > span:first-child'};
Object.entries(selectors).forEach(([k,s])=>{const el=document.querySelector(s);if(el)el.textContent=c.texts[k]});
const title=document.querySelector('#hero-title');title.replaceChildren(document.createTextNode(c.texts.heroTitle),document.createElement('br'));const accent=document.createElement('span');accent.textContent=c.texts.heroAccent;title.append(accent);
const button=document.querySelector('.hero-copy .button');button.firstChild.textContent=c.texts.heroButton+' ';
const storyImage=document.querySelector('.story-image img');if(storyImage)storyImage.src=c.storyImage;
const count=document.querySelector('.filter[data-category="All"] span');count.textContent=String(c.products.length).padStart(2,'0');

document.querySelector('.footer-bottom > span:nth-child(2)').textContent='';
const copyright=document.querySelector('.footer-bottom > span:first-child');if(/storefront design concept/i.test(copyright.textContent))copyright.textContent='© '+new Date().getFullYear()+' '+c.brand;
document.querySelector('.brand').setAttribute('aria-label',c.brand+' home');
if(c.contacts.email||c.contacts.address){const contact=document.createElement('section');contact.className='contact-details';contact.setAttribute('aria-label','Email and address');const title=document.createElement('span');title.className='eyebrow';title.textContent='FIND US';contact.append(title);if(c.contacts.email){const a=document.createElement('a');a.href='mailto:'+c.contacts.email;a.textContent=c.contacts.email;contact.append(a)}if(c.contacts.address){const a=document.createElement('p');a.className='store-address';const pin=document.createElement('img');pin.src='/location-pin.svg';pin.alt='';pin.width=20;pin.height=25;const text=document.createElement('span');text.textContent=c.contacts.address;a.append(pin,text);contact.append(a)}document.querySelector('.footer-bottom').before(contact)}
})();
