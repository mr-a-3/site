import {AnimatePresence,motion,useReducedMotion,useMotionValue,useSpring,useInView} from 'motion/react';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {PointerEvent,ReactNode} from 'react';
import {ProductModel,productImage} from './ProductModel';
import {BackgroundDepth} from './BackgroundDepth';
import {editorialEase,slideDuration,motionTiming} from './motion-tokens';
import type {StoreData} from './types';
function Magnetic({children,className,onClick,href}:{children:ReactNode;className:string;onClick?:()=>void;href?:string}){
 const reduced=useReducedMotion();const mx=useMotionValue(0),my=useMotionValue(0);const x=useSpring(mx,{stiffness:180,damping:22}),y=useSpring(my,{stiffness:180,damping:22});
 const move=(e:PointerEvent<HTMLElement>)=>{if(reduced||e.pointerType!=='mouse')return;const r=e.currentTarget.getBoundingClientRect();mx.set((e.clientX-r.left-r.width/2)*.1);my.set((e.clientY-r.top-r.height/2)*.13)};
 const shared={className,onPointerMove:move,onPointerLeave:()=>{mx.set(0);my.set(0)},style:{x:reduced?0:x,y:reduced?0:y}};
 return href?<motion.a {...shared} href={href}>{children}</motion.a>:<motion.button {...shared} type="button" onClick={onClick}>{children}</motion.button>
}
export function Hero({store}:{store:StoreData}){
 const list=useMemo(()=>store.products.filter((p,i)=>p.featured??i<3),[store.products]);const reduced=useReducedMotion();const [index,setIndex]=useState(0),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[hidden,setHidden]=useState(document.hidden),[blocked,setBlocked]=useState(false),[announcement,setAnnouncement]=useState('');
 const heroRef=useRef<HTMLDivElement>(null);const visible=useInView(heroRef,{amount:.05});
 const elapsed=useRef(0),last=useRef(0),startX=useRef<number|null>(null);const fill=useMotionValue(0);const product=list[index];
 const isPlaying=visible&&!hovered&&!focused&&!hidden&&!blocked&&!reduced&&list.length>1;
 const discounted=typeof product.discountPrice==='number'&&product.discountPrice>=0&&product.discountPrice<product.price;
 const percent=discounted?Math.floor((1-product.discountPrice!/product.price)*100+1e-7):0;
 const format=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:store.currency,maximumFractionDigits:2}).format(n);
 useEffect(()=>{const listener=()=>setHidden(document.hidden);document.addEventListener('visibilitychange',listener);const observer=new MutationObserver(()=>setBlocked(!!document.querySelector('dialog[open],.cart-drawer.open')));observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','class']});return()=>{document.removeEventListener('visibilitychange',listener);observer.disconnect()}},[]);
 useEffect(()=>{elapsed.current=0;fill.set(0)},[index,fill]);
 useEffect(()=>{if(!isPlaying){last.current=0;return}let frame=0;function tick(now:number){if(last.current)elapsed.current+=Math.min(now-last.current,100);last.current=now;fill.set(Math.min(elapsed.current/slideDuration,1));if(elapsed.current>=slideDuration){elapsed.current=0;fill.set(0);setIndex(i=>(i+1)%list.length)}frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);last.current=0}},[isPlaying,list.length,fill]);
 useEffect(()=>{const next=list[(index+1)%list.length];if(next){const image=new Image();image.src=productImage(next.image)}},[index,list]);
 function choose(next:number){elapsed.current=0;fill.set(0);setIndex((next+list.length)%list.length);setAnnouncement(`${(next+list.length)%list.length+1} of ${list.length}: ${list[(next+list.length)%list.length].name}`)}
 const line=(text:string,accent=false,delay=0)=><span className={'e-title-mask'+(accent?' e-accent':'')}><motion.span initial={reduced?{opacity:0}:{y:'105%',opacity:0}} animate={{y:0,opacity:1}} transition={{duration:reduced ? .15:motionTiming.line,delay:reduced?0:delay,ease:editorialEase}}>{text}</motion.span></span>;
 return <><BackgroundDepth/>
 <div className="e-hero-layout" ref={heroRef} data-animate={visible&&!hidden&&!blocked&&!reduced}>
  <div className="e-copy">
   <h1 id="hero-title" className="e-title">{line(store.texts.heroTitle)}{line(store.texts.heroAccent,true,motionTiming.stagger)}</h1>
   <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:reduced?0:.5,duration:.65}}><Magnetic className="e-primary" href="#collection">{store.texts.heroButton}</Magnetic></motion.div>
  </div>
  <div className="e-product-area" onPointerEnter={e=>{if(e.pointerType==='mouse')setHovered(true)}} onPointerLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setFocused(false)}}>
   <div className="e-visual" role="region" aria-roledescription="carousel" aria-label="Featured objects" tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();choose(index+(e.key==='ArrowRight'?1:-1))}}} onPointerDown={e=>{if(e.pointerType==='touch')startX.current=e.clientX}} onPointerUp={e=>{if(startX.current!==null&&Math.abs(e.clientX-startX.current)>45)choose(index+(e.clientX<startX.current?1:-1));startX.current=null}} onPointerCancel={()=>{startX.current=null}}>
    <div className="e-image-stage">{discounted&&<span className="sale-badge">{percent}% OFF</span>}<AnimatePresence initial={false} mode="sync"><motion.div className="e-scene" key={product.id} initial={reduced?{opacity:0}:{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:1,x:0}} transition={{duration:reduced ? .15:motionTiming.slide,ease:editorialEase}}>
      <motion.div className="e-ghost" aria-hidden="true" initial={reduced?{}:{x:50}} animate={{x:0}} exit={reduced?{}:{x:-70}} transition={{duration:.9,ease:editorialEase}}>{product.category.toUpperCase()}.</motion.div>
      <div className="e-photo-drift"><ProductModel image={product.image} alt={product.name} priority={index===0}/></div>
    </motion.div></AnimatePresence></div>
    <div className="e-caption"><AnimatePresence initial={false} mode="wait"><motion.div key={product.id} className="e-product-copy" initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:-6}} transition={{duration:reduced ? .1:.45,ease:editorialEase}}><h2>{product.name}</h2><p>{discounted?<span className="sale-prices"><del aria-label="Original price">{format(product.price)}</del><strong aria-label="Sale price">{format(product.discountPrice!)}</strong></span>:format(product.price)}</p></motion.div></AnimatePresence><Magnetic className="e-view" onClick={()=>window.formViewProduct?.(product.id)}>View<span className="sr-only"> {product.name}</span></Magnetic></div>
   </div>
   <div className="e-slider-controls"><div className="e-indicators" role="group" aria-label="Choose a featured object">{list.map((p,i)=><button type="button" key={p.id} onClick={()=>choose(i)} aria-label={`Show ${p.name}`} aria-pressed={i===index} className={'e-indicator'+(i===index?' is-active':'')}><span className="e-progress-track"><motion.span className="e-progress-fill" style={{scaleX:i===index?fill:0}}/></span></button>)}</div></div>
  </div>
 </div><span className="sr-only" aria-live="polite">{announcement}</span>
 </>
}



