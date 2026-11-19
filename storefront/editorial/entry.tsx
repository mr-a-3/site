import {createRoot} from 'react-dom/client';
import {MotionConfig} from 'motion/react';
import {Hero} from './Hero';
import './hero.css';
function mount(){const el=document.querySelector<HTMLElement>('.hero');if(!el||!window.STORE_DATA||el.dataset.editorialMounted)return;el.dataset.editorialMounted='true';el.className='editorial-hero';createRoot(el).render(<MotionConfig reducedMotion="user"><Hero store={window.STORE_DATA}/></MotionConfig>)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
