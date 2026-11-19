/** Broad feline muzzle and heavy shoulders distinguish these cats at small sizes. */
export function BigCat({kind}:{kind:'tiger'|'lion'}){
 const lion=kind==='lion', fur=lion?'#c69349':'#dd8738', dark='#392a25';
 return <svg className={'e-wildcat e-'+kind} viewBox="0 0 220 126" fill="none">
  <path d="M57 58C28 66 21 47 17 32Q13 21 7 27" stroke={fur} strokeWidth="8" strokeLinecap="round"/>
  {lion?<path d="M5 18Q18 18 16 32L8 39Q1 30 5 18Z" fill="#684027"/>:<path d="m17 32-6 4m13 11-6 5m19 5-2 7" stroke={dark} strokeWidth="5"/>}
  <g className="e-cat-legs-back" fill={lion?'#a57137':'#ad602d'}>
   <path d="M63 70 76 77 63 103 75 108Q79 117 68 117H52L48 108Z"/>
   <path d="M140 66 154 71 151 106 163 109 164 118H140Q134 113 136 103Z"/>
  </g>
  <path d="M43 58Q46 40 72 41L121 44Q142 29 164 43L175 68Q159 83 137 80L91 78Q62 91 46 77Z" fill={fur}/>
  <path d="M84 72Q114 76 143 67L146 79 91 84Z" fill="#f0cf99"/>
  <g className="e-cat-legs-front" fill={fur}>
   <path d="M48 63Q70 61 72 80L62 98 65 106Q83 106 81 118H54L48 109 52 90 42 78Z"/>
   <path d="M145 57Q162 57 169 74L167 106Q184 108 182 119H155Q149 118 150 109L143 82Z"/>
   <path d="m61 112 1 6m8-6 1 6m91-5v6m8-6v6" stroke="#80532f" strokeWidth="1.5"/>
  </g>
  {!lion&&<g fill={dark}><path d="m62 43 12 1-4 22-5-12Zm20 0 10 1-6 26-3-16Zm21 1 10 1-8 23-3-12Zm22-2 10-3-9 28-4-12ZM46 57l14 8-13 1Zm9 15 13 5-10 5Zm98 16 14 4-13 4Zm1 14 12 3-12 3Z"/></g>}
  {lion&&<>
   <path d="m145 13 15-9 12 5 17-4 9 12 15 7-2 16 7 14-10 12-2 18-16 4-13 15-14-12-18-2-3-16-13-13 5-17-3-16Z" fill="#684027"/>
   <path d="m151 20 13-10 11 8 13-7 12 17-4 17 9 15-12 10-8 18-13-10-14 5-7-19-11-13 9-14Z" fill="#89552d"/>
  </>}
  <circle cx="151" cy="23" r="10" fill={fur}/><circle cx="193" cy="23" r="10" fill={fur}/>
  <circle cx="151" cy="23" r="5" fill={dark}/><circle cx="193" cy="23" r="5" fill={dark}/>
  <path d="M148 26Q170 15 195 27L200 48 193 64 175 75 155 66 144 48Z" fill={fur}/>
  <path d="m147 44 12 3-4 13-9-7m51-9-12 3 5 14 9-9" fill="#f7dfb7"/>
  <path d="m154 35 12 4m14 0 12-4" stroke={dark} strokeWidth="4" strokeLinecap="round"/>
  <path d="m156 40 9 2-7 3Zm26 2 9-2-2 5Z" fill="#f5e3a1"/>
  <path d="m160 41 2 3m23-2 2 2" stroke={dark} strokeWidth="2"/>
  <ellipse cx="165" cy="57" rx="10" ry="8" fill="#f7dfb7"/><ellipse cx="182" cy="57" rx="10" ry="8" fill="#f7dfb7"/>
  <path d="M167 49Q174 46 181 49L174 56Z" fill={dark}/>
  <path d="M174 55v7m0-1q-6 6-11 0m11 0q6 6 11 0" stroke={dark} strokeWidth="1.8" strokeLinecap="round"/>
  {!lion&&<g fill={dark}><path d="m163 24 9 2-1 11-4-6Zm13 2 10-2-5 9-4 4ZM146 32l10 3-10 3Zm-2 11 12 6-10 1Zm51-11-9 3 11 3Zm4 12-13 6 11 1Zm-43 20 9 3-4 3Zm35 0-9 3 5 3Z"/></g>}
 </svg>
}
