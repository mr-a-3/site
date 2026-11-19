(() => {
  const track=document.querySelector('#slide-track');
  const region=document.querySelector('.hero-visual');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const slides=products.slice(0,3).map((p,i)=>({id:p.id,title:p.name,category:'0'+(i+1)+' — '+p.category.toUpperCase(),price:money(p.price)}));
  track.innerHTML=products.slice(0,3).map((p,i)=>`<div class="hero-slide" role="group" aria-roledescription="slide" aria-label="${i+1} of ${slides.length}: ${escapeHtml(p.name)}"><img src="${escapeHtml(imageUrl(p,1400))}" alt="${escapeHtml(p.name)}"><span class="slide-word" aria-hidden="true">${escapeHtml(p.category.toUpperCase())}.</span></div>`).join('');
  let current=0,paused=reduced.matches,timer,startX=null;
  document.querySelector('.slide-dots').innerHTML=slides.map((p,i)=>`<button data-slide="${i}" aria-label="Show ${escapeHtml(p.title)}" aria-pressed="false"></button>`).join('');
  const dots=[...document.querySelectorAll('[data-slide]')];
  const pauseButton=document.querySelector('#slide-pause');
  function show(index,manual=false){
    current=(index+slides.length)%slides.length;
    track.style.transform=`translateX(-${current*100}%)`;
    [...track.children].forEach((el,i)=>{el.inert=i!==current;el.classList.toggle('active',i===current);el.setAttribute('aria-hidden',i!==current)});
    dots.forEach((b,i)=>{b.classList.toggle('selected',i===current);b.setAttribute('aria-pressed',i===current)});
    const item=slides[current];
    document.querySelector('#slide-title').textContent=item.title;
    document.querySelector('#slide-category').textContent=item.category;
    document.querySelector('#slide-price').textContent=item.price;
    document.querySelector('#slide-number').textContent=`0${current+1} / 0${slides.length}`;
    document.querySelector('#hero-product').setAttribute('aria-label',`View ${item.title}`);
    if(manual)document.querySelector('#slide-announcement').textContent=`${current+1} of ${slides.length}: ${item.title}`;
  }
  function schedule(){clearInterval(timer);if(!paused&&!reduced.matches&&!document.hidden&&slides.length>1)timer=setInterval(()=>{if(!document.querySelector('dialog[open]')&&!document.querySelector('.cart-drawer.open'))show(current+1)},5000)}
  function updatePause(){pauseButton.textContent=paused?'Play':'Pause';pauseButton.setAttribute('aria-label',paused?'Play slideshow':'Pause slideshow');pauseButton.setAttribute('aria-pressed',paused);document.querySelector('.slide-controls').dataset.playing=String(!paused&&!reduced.matches);schedule()}
  function navigate(index){show(index,true);schedule()}
  dots.forEach(b=>b.addEventListener('click',()=>navigate(Number(b.dataset.slide))));
  pauseButton.addEventListener('click',()=>{paused=!paused;updatePause()});
  region.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();navigate(current+(e.key==='ArrowRight'?1:-1))}});
  region.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')startX=e.clientX});
  region.addEventListener('pointerup',e=>{if(startX!==null&&Math.abs(e.clientX-startX)>45)navigate(current+(e.clientX<startX?1:-1));startX=null});
  region.addEventListener('pointercancel',()=>{startX=null});
  document.querySelector('#hero-product').addEventListener('click',e=>{e.stopImmediatePropagation();viewProduct(slides[current].id)},true);
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',()=>{paused=reduced.matches;updatePause()});
  show(0);updatePause();
})();
