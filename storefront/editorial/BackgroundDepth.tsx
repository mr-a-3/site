import {useEffect,useRef,useState} from 'react';
import {useInView,useReducedMotion} from 'motion/react';
import './background-depth.css';
import {BigCat} from './BigCat';
import {PersianCat} from './PersianCat';
import {Sticker} from './Sticker';

const animals=['plane','peacock','tiger','lion','sportsCar','persianCat','astronaut'] as const;
const randomAnimal=()=>animals[Math.floor(Math.random()*animals.length)];
/** Composited gradient layers keep the same flowing treatment on phones and desktops. */
export function BackgroundDepth(){
 const ref=useRef<HTMLDivElement>(null);
 const visible=useInView(ref,{amount:.05});
 const reduced=useReducedMotion();
 const [flight,setFlight]=useState<typeof animals[number]>(randomAnimal);
 const [pageVisible,setPageVisible]=useState(!document.hidden);
 useEffect(()=>{const onVisibility=()=>setPageVisible(!document.hidden);document.addEventListener('visibilitychange',onVisibility);return()=>document.removeEventListener('visibilitychange',onVisibility)},[]);
 return <div ref={ref} className="e-depth" aria-hidden="true" data-character={flight} data-animate={visible&&pageVisible&&!reduced}>
  <div className="e-gradient-flow"><span onAnimationIteration={()=>setFlight(previous=>{const next=animals.filter(animal=>animal!==previous);return next[Math.floor(Math.random()*next.length)]})}/></div>
  {flight==='plane'&&<div className="e-plane-route"><div className="e-plane-flight">
   <svg className="e-paper-plane" viewBox="0 0 48 40" fill="none">
    <path d="M46 2 28 37 20 23 2 17 46 2Z" fill="currentColor" fillOpacity=".18"/>
    <path d="M46 2 28 37 20 23 2 17 46 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="m46 2-26 21 2 10 6-6" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
   </svg>
  </div></div>}
  {flight==='peacock'&&<div className="e-peacock-route"><div className="e-peacock-flight">
   <svg className="e-peacock" viewBox="0 0 160 90" fill="none">
    <g className="e-peacock-tail" stroke="currentColor" strokeWidth="1.2">
     <path d="M105 53C77 58 43 38 5 57C40 55 66 78 105 53Z" fill="currentColor" fillOpacity=".12"/>
     <path d="M105 53C75 64 46 55 10 77C45 65 78 82 105 53Z" fill="currentColor" fillOpacity=".18"/>
     <path d="M105 53C73 54 44 24 14 35C49 40 73 64 105 53Z" fill="currentColor" fillOpacity=".1"/>
     <ellipse cx="26" cy="53" rx="8" ry="4" fill="#bd9562" fillOpacity=".7"/><ellipse cx="26" cy="53" rx="3" ry="2" fill="currentColor"/>
     <ellipse cx="31" cy="68" rx="8" ry="4" fill="#bd9562" fillOpacity=".7"/><ellipse cx="31" cy="68" rx="3" ry="2" fill="currentColor"/>
     <ellipse cx="33" cy="39" rx="7" ry="4" fill="#bd9562" fillOpacity=".7"/><ellipse cx="33" cy="39" rx="3" ry="2" fill="currentColor"/>
    </g>
    <path d="M95 53Q113 62 124 48L132 31Q139 32 141 26Q141 19 134 19Q127 19 126 27L116 42Q104 40 95 53Z" fill="currentColor"/>
    <path d="m141 24 9 4-10 1" fill="#bd9562"/>
    <circle cx="136" cy="24" r="1.4" fill="#fff9ed"/>
    <path d="m132 19-4-9m6 9 1-11m1 11 6-8" stroke="currentColor" strokeWidth="1.2"/>
    <g fill="currentColor"><circle cx="128" cy="9" r="2"/><circle cx="135" cy="7" r="2"/><circle cx="142" cy="10" r="2"/></g>
    <g className="e-peacock-wing" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
     <path d="M112 46Q100 22 73 13L80 28 69 24 81 38 73 36Q89 55 108 53Z" fill="currentColor" fillOpacity=".65"/>
     <path d="m81 27 24 20M83 37l21 12" stroke="#fff9ed" strokeOpacity=".45"/>
    </g>
   </svg>
  </div></div>}
  {(flight==='tiger'||flight==='lion')&&<div className="e-cat-route"><div className="e-cat-travel">
   <BigCat kind={flight}/> </div></div>}
  {flight==='persianCat'&&<div className="e-cat-route"><div className="e-cat-travel"><PersianCat/></div></div>}
  {(flight==='sportsCar'||flight==='astronaut')&&<div className={"e-sticker-route e-sticker-route-"+flight}><div className="e-sticker-travel">
   <Sticker kind={flight}/></div></div>}
 </div>
}


