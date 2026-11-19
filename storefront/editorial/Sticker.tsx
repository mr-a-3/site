function Wheel({x,y,r=18}:{x:number;y:number;r?:number}){
 return <g><circle cx={x} cy={y} r={r} fill="#29292d"/><circle cx={x} cy={y} r={r-5} fill="#aeb7bf"/><g className="e-drawn-wheel" style={{transformOrigin:`${x}px ${y}px`}} stroke="#46505b" strokeWidth="2.5"><path d={`M${x-r+6} ${y}h${2*r-12}M${x} ${y-r+6}v${2*r-12}M${x-8} ${y-8}l16 16m-16 0 16-16`}/></g><circle cx={x} cy={y} r="3" fill="#e5e9eb"/></g>;
}

/** Original side-profile drawings share the animals' lightweight SVG animation. */
export function Sticker({kind}:{kind:'sportsCar'|'astronaut'}){
 return <svg className={`e-sticker e-sticker-${kind}`} viewBox="0 0 260 140" fill="none"><g className="e-sticker-body">
 {kind==='sportsCar'&&<>
  <path d="M22 89 31 67 60 64Q80 33 114 35Q144 34 169 65L222 73 240 88 237 108H22Z" fill="#c73542" stroke="#722b37" strokeWidth="2"/>
  <path d="M68 64Q88 40 114 41Q137 40 158 64Z" fill="#aac9d5"/><path d="m117 41 3 24" stroke="#4c4249" strokeWidth="5"/>
  <path d="m123 70 2 28m-51-27-5 26M30 99h196m-90-25h13" stroke="#812e3b" strokeWidth="2"/>
  <path d="M20 64h39v6H20zm9 6v13" fill="#812e3b"/><path d="m224 77 8 5-2 7h-10Z" fill="#ffe6a1"/><path d="M25 81h10v8H24" fill="#f98578"/>
  <path d="M177 69h29M35 106h188" stroke="#e17d79" strokeWidth="3"/><path d="M226 99h13v7h-13" fill="#39383e"/>
  <Wheel x={64} y={105}/><Wheel x={198} y={105}/>
 </>}
 {kind==='astronaut'&&<>
  <g className="e-drawn-flame"><path d="m74 89-63 8 19 9-24 17 69-5Z" fill="#ee8241"/><path d="m75 96-43 12 12 5-17 9 50-12Z" fill="#f5c65b"/><path d="m76 101-28 10 27 2Z" fill="#fff1bd"/></g>
  <path d="m93 86-7-15 30 7 24 12m-43 24-12 20 32-8 20-16" fill="#b8384c" stroke="#702f3f" strokeWidth="2"/>
  <path d="M77 88Q148 66 207 86L239 101 207 117Q151 135 77 118Z" fill="#e5e9e7" stroke="#384f60" strokeWidth="2"/><path d="M201 84q25 3 38 17-14 15-36 18 9-18-2-35Z" fill="#426f95"/>
  <path d="M77 88h12v30H77Z" fill="#426f95"/><circle cx="155" cy="102" r="17" fill="#bd4251"/><circle cx="155" cy="102" r="11" fill="#304c62"/><path d="m150 98 8-5" stroke="#9dc5d7" strokeWidth="3"/>
  <path d="m125 53-8 21 14 11 13-8 16 4 8-10-22-15Z" fill="#dce5e5" stroke="#425763" strokeWidth="3"/>
  <path d="m128 76-9 17h17l10-15m7-1 14 11h16" stroke="#dce5e5" strokeWidth="9" strokeLinecap="round"/>
  <path d="m143 55 16 11 17-4" stroke="#dce5e5" strokeWidth="10" strokeLinecap="round"/>
  <rect x="113" y="48" width="12" height="24" rx="5" fill="#8ba7ae"/>
  <circle cx="139" cy="35" r="23" fill="#e7eeee" stroke="#425763" strokeWidth="3"/><path d="M134 18q24-1 24 19-1 15-23 14-12-15-1-33Z" fill="#253d4d"/><path d="m142 23 8 6" stroke="#91b7c5" strokeWidth="4" strokeLinecap="round"/>
 </>}
 </g></svg>;
}
