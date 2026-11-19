import {motion,useMotionValue,useSpring,useReducedMotion} from 'motion/react';
import type {PointerEvent} from 'react';
import {useState} from 'react';
export function productImage(image:string,width=1400){return image.startsWith('photo-')?`https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=85`:image}
/** ProductModel slot: no GLB has been supplied. The photo remains the accessible
 * fallback. Replace the inner photograph with a lazy R3F Canvas/Suspense viewer
 * when matching models exist; never import Three.js for this photo-only stage. */
export function ProductModel({image,alt,priority=false}:{image:string;alt:string;priority?:boolean}){
 const reduced=useReducedMotion();const [loaded,setLoaded]=useState(false);const [failed,setFailed]=useState(false);
 const x=useMotionValue(0),y=useMotionValue(0),rx=useSpring(x,{stiffness:110,damping:24}),ry=useSpring(y,{stiffness:110,damping:24});
 function move(e:PointerEvent<HTMLDivElement>){if(reduced||e.pointerType!=='mouse'||!matchMedia('(hover: hover) and (pointer: fine)').matches)return;const r=e.currentTarget.getBoundingClientRect();const px=Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5)),py=Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5));x.set(-py*4);y.set(px*4)}
 return <div className="e-model" onPointerMove={move} onPointerLeave={()=>{x.set(0);y.set(0)}}>
  <motion.div className="e-model-plane" style={{rotateX:reduced?0:rx,rotateY:reduced?0:ry,transformPerspective:1000}}>
   <motion.img className="e-photo" src={productImage(image)} alt={alt} width={1200} height={1200} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} onLoad={()=>setLoaded(true)} onError={()=>{setLoaded(true);setFailed(true)}} initial={{opacity:0,scale:reduced?1:1.045}} animate={{opacity:loaded?1:0,scale:1}} transition={{duration:reduced ? .15:.75}}/>
   {failed&&<div className="e-image-unavailable">{alt}<span>Image unavailable</span></div>}
  </motion.div>
  {!loaded&&<span className="e-image-loading" aria-hidden="true"/>}
  <div className="e-specular" aria-hidden="true"/>
 </div>
}


