// Store destinations: provide full social profile URLs and an international
// WhatsApp number (digits only). Empty destinations remain clearly unavailable.
const STORE_CONTACTS = {...window.STORE_DATA.contacts,whatsapp:window.STORE_DATA.contacts.whatsapp.replace(/\D/g,'')};
(() => {
  const headerRoot = document.documentElement;
  const scrollHeader = document.querySelector('.header');
  const scrollMenu = document.querySelector('#menu-toggle');
  const scrollPosition = () => Math.max(0, Math.min(window.scrollY, headerRoot.scrollHeight - window.innerHeight));
  let compactHeader = false, headerHidden = false, headerFrame = 0;
  let anchorY = scrollPosition();
  let keyboardNavigation = true;

  function setHeaderHidden(hidden, y) {
    anchorY = y;
    if (hidden === headerHidden) return;
    headerHidden = hidden;
    headerRoot.classList.toggle('header-away', hidden);
  }

  function updateHeader() {
    headerFrame = 0;
    const y = scrollPosition();
    const compact = y > (compactHeader ? 24 : 80);
    if (compact !== compactHeader) {
      compactHeader = compact;
      headerRoot.classList.toggle('header-compact', compact);
    }

    // A tap can leave a button focused after the menu or bag closes.
    const keyboardFocus = keyboardNavigation && scrollHeader?.contains(document.activeElement);
    const menuOpen = scrollMenu?.getAttribute('aria-expanded') === 'true';
    if (y < 100 || menuOpen || keyboardFocus) {
      setHeaderHidden(false, y);
    } else if (headerHidden) {
      anchorY = Math.max(anchorY, y);
      if (anchorY - y >= 10) setHeaderHidden(false, y);
    } else {
      anchorY = Math.min(anchorY, y);
      if (y - anchorY >= 24) setHeaderHidden(true, y);
    }
  }

  window.addEventListener('scroll', () => {
    if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
  }, { passive: true });
  const usePointer = () => { keyboardNavigation = false; };
  window.addEventListener('pointerdown', usePointer, { capture: true, passive: true });
  window.addEventListener('touchstart', usePointer, { capture: true, passive: true });
  window.addEventListener('wheel', usePointer, { capture: true, passive: true });
  window.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    keyboardNavigation = true;
    if (scrollHeader?.contains(document.activeElement)) setHeaderHidden(false, scrollPosition());
  }, true);
  scrollHeader?.addEventListener('focusin', () => {
    if (keyboardNavigation) setHeaderHidden(false, scrollPosition());
  });
  if (scrollMenu) new MutationObserver(() => {
    if (scrollMenu.getAttribute('aria-expanded') === 'true') setHeaderHidden(false, scrollPosition());
  }).observe(scrollMenu, { attributes: true, attributeFilter: ['aria-expanded'] });
  window.addEventListener('pageshow', () => {
    setHeaderHidden(false, scrollPosition());
    updateHeader();
  });
  updateHeader();
  const icons={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',moon:'<path d="M20.5 13.4A8.5 8.5 0 0 1 10.6 3.5a8.5 8.5 0 1 0 9.9 9.9Z"/>',user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',whatsapp:'<path fill-rule="evenodd" d="M12 2a10 10 0 0 0-8.66 15L2 22l5.13-1.35A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.18 15.26l-.32-.19-3 .79.8-2.92-.21-.34A8.2 8.2 0 0 1 12 3.8Z"/><path d="M8.8 6.8c-.2-.45-.42-.46-.62-.47h-.53c-.2 0-.53.08-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35l-1.98-.94c-.27-.1-.47-.15-.67.15-.2.3-.76.94-.93 1.14-.17.2-.35.23-.65.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53l-1.06-2.39Z"/>',facebook:'<path d="M14 21v-8h3l.5-4H14V7c0-1.1.4-2 2-2h2V1.5A24 24 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v8"/>',instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'};
  const svg=name=>`<svg viewBox="0 0 24 24" ${name==='whatsapp'?'class="whatsapp-logo"':''} aria-hidden="true" focusable="false">${icons[name]}</svg>`;
  const actions=document.querySelector('.header-actions');
  const themeButton=document.createElement('button');themeButton.type='button';themeButton.id='theme-toggle';themeButton.className='icon-button theme-toggle';
  function updateTheme(theme){const dark=theme==='dark';document.documentElement.dataset.theme=theme;themeButton.innerHTML=svg(dark?'sun':'moon')+'<span class="nav-action-label">Dark mode</span>';themeButton.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');themeButton.setAttribute('aria-pressed',String(dark));themeButton.title=dark?'Light mode':'Dark mode';document.querySelector('meta[name="theme-color"]').content=dark?'#101311':'#f8f9f6'}
  themeButton.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';updateTheme(next);try{localStorage.setItem('form-theme',next)}catch{}});
  actions.prepend(themeButton);updateTheme(document.documentElement.dataset.theme||'light');
  const accountButton=document.createElement('button');accountButton.type='button';accountButton.id='account-open';accountButton.className='icon-button';accountButton.setAttribute('aria-label','Customer account');accountButton.innerHTML=svg('user');actions.insertBefore(accountButton,document.querySelector('#cart-open'));
  const accountDialog=document.querySelector('#account-dialog');let checkoutIntent=false;
  const mobileNav=document.querySelector('#mobile-nav'),menuToggle=document.querySelector('#menu-toggle');
  const menuActions=document.createElement('div');menuActions.className='mobile-menu-actions';menuActions.setAttribute('role','group');menuActions.setAttribute('aria-label','Account and appearance');mobileNav.prepend(menuActions);
  accountButton.insertAdjacentHTML('beforeend','<span class="nav-action-label">Account</span>');
  const phoneMenu=matchMedia('(max-width:700px)');
  function placeMenuActions(){if(phoneMenu.matches){menuActions.append(themeButton,accountButton)}else{actions.prepend(themeButton);actions.insertBefore(accountButton,document.querySelector('#cart-open'));mobileNav.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open navigation')}}
  phoneMenu.addEventListener('change',placeMenuActions);placeMenuActions();
  accountButton.addEventListener('click',()=>{checkoutIntent=false;mobileNav.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open navigation');accountDialog.showModal()});
  mobileNav.addEventListener('keydown',e=>{if(e.key==='Escape'){mobileNav.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open navigation');menuToggle.focus()}});
  document.querySelector('#checkout').addEventListener('click',e=>{e.stopImmediatePropagation();checkoutIntent=true;closeCart();window.openCheckout()},true);
  document.querySelector('#continue-guest').addEventListener('click',()=>{accountDialog.close();if(checkoutIntent){document.querySelector('#checkout-review').innerHTML=cart.map(i=>{const p=products.find(p=>p.id===i.id);return `<div class="review-line"><span>${escapeHtml(p.name)} × ${i.qty}</span><span>${money(currentPrice(p)*i.qty)}</span></div>`}).join('')+`<div class="review-line"><strong>Subtotal</strong><strong>${money(total())}</strong></div><p class="guest-status">Continuing as guest · No account required</p>`;document.querySelector('#checkout-dialog').showModal()}else document.querySelector('#collection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})});
  const socials=document.createElement('div');socials.className='social-links';socials.setAttribute('aria-label','Follow and contact us');
  function destination(key){const value=STORE_CONTACTS[key];if(!value)return '';if(key==='whatsapp')return /^\d{7,15}$/.test(value)?`https://wa.me/${value}`:'';try{const url=new URL(value);const allowed=key==='facebook'?['facebook.com','www.facebook.com','m.facebook.com']:['instagram.com','www.instagram.com'];return url.protocol==='https:'&&allowed.includes(url.hostname)?url.href:''}catch{return ''}}
  ['whatsapp','facebook','instagram'].forEach(key=>{const label=key==='whatsapp'?'WhatsApp':key[0].toUpperCase()+key.slice(1);const url=destination(key);const el=document.createElement(url?'a':'button');el.className='social-link';el.innerHTML=`${svg(key)}<span>${label}</span><span class="social-arrow" aria-hidden="true"></span>`;if(url){el.href=url;el.target='_blank';el.rel='noopener noreferrer';el.setAttribute('aria-label',`${label} (opens in a new tab)`)}else{el.type='button';el.disabled=true;el.title=`${label} — coming soon`;el.setAttribute('aria-label',`${label} — coming soon`)}socials.append(el)});
  const socialSection=document.createElement('section');socialSection.className='social-section';socialSection.setAttribute('aria-labelledby','connect-heading');
  const heading=document.createElement('div');heading.className='social-heading';heading.innerHTML='<span class="eyebrow">CONTACT US</span><h2 id="connect-heading">Let’s connect.</h2>';socialSection.append(heading);
  const numbers=document.createElement('div');numbers.className='contact-numbers';
  const addNumber=(label,value,href,newTab=false)=>{const a=document.createElement('a');a.className='contact-number';a.href=href;if(newTab){a.target='_blank';a.rel='noopener noreferrer'}const caption=document.createElement('span');caption.className='number-label';caption.textContent=label;const number=document.createElement('strong');number.textContent=value;const arrow=document.createElement('span');arrow.className='number-arrow';arrow.textContent='';arrow.setAttribute('aria-hidden','true');a.append(caption,number,arrow);numbers.append(a)};
  if(STORE_CONTACTS.phone)addNumber('CALL US',STORE_CONTACTS.phone,'tel:'+STORE_CONTACTS.phone.replace(/[^+0-9]/g,''));
  if(STORE_CONTACTS.phone2)addNumber('ALTERNATE PHONE',STORE_CONTACTS.phone2,'tel:'+STORE_CONTACTS.phone2.replace(/[^+0-9]/g,''));
  if(destination('whatsapp'))addNumber('WHATSAPP',window.STORE_DATA.contacts.whatsapp,destination('whatsapp'),true);
  if(!numbers.children.length){const note=document.createElement('p');note.className='contact-number-pending';note.textContent='Phone numbers coming soon.';numbers.append(note)}
  const mapUrl=STORE_CONTACTS.mapUrl|| (STORE_CONTACTS.address?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(STORE_CONTACTS.address):'');
  let safeMap='';try{const u=new URL(mapUrl);if(u.protocol==='https:'&&!u.username&&!u.password&&(['maps.app.goo.gl','maps.google.com','www.openstreetmap.org','openstreetmap.org'].includes(u.hostname)||['google.com','www.google.com','goo.gl'].includes(u.hostname)&&u.pathname.startsWith('/maps')))safeMap=u.href}catch{}
  const location=document.createElement(safeMap?'a':'button');location.className='social-link location-link';location.innerHTML='<svg class="location-logo" viewBox="0 0 24 30" aria-hidden="true"><defs><linearGradient id="contact-location-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ec3680"/><stop offset=".46" stop-color="#fa5656"/><stop offset="1" stop-color="#ffa409"/></linearGradient></defs><path fill="url(#contact-location-gradient)" fill-rule="evenodd" d="M12 0C5.65 0 1 4.75 1 10.6 1 17.5 12 30 12 30s11-12.5 11-19.4C23 4.75 18.35 0 12 0Zm0 5.3a5.3 5.3 0 1 0 0 10.6 5.3 5.3 0 0 0 0-10.6Z"/></svg><span>Location</span>';
  if(safeMap){location.href=safeMap;location.target='_blank';location.rel='noopener noreferrer';location.setAttribute('aria-label','Open store location in Maps (opens in a new tab)')}else{location.type='button';location.addEventListener('click',()=>toast('Store location is currently unavailable.'))}socials.append(location);
  socialSection.append(numbers,socials);document.querySelector('.footer-bottom').before(socialSection);
  const wa=destination('whatsapp');if(wa){const floating=document.createElement('a');floating.className='whatsapp-float';floating.href=wa;floating.target='_blank';floating.rel='noopener noreferrer';floating.setAttribute('aria-label','Chat on WhatsApp (opens in a new tab)');floating.innerHTML=svg('whatsapp')+'<span>Let’s talk</span>';document.body.append(floating)}
})();
