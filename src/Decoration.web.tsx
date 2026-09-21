import React from 'react';
export function Decoration({ color, width=96, rich=false }: {color:string;width?:number;rich?:boolean}) {
 return <svg width={width} height={width*0.55} viewBox="0 0 120 66" aria-hidden="true" focusable="false" style={{display:'block',flexShrink:0}}>
  <g fill="none" stroke="#869574" strokeWidth="1.4" strokeLinecap="round">
   <path d="M53 61Q70 45 74 24M55 59Q81 54 103 34"/>
   <path d="M66 45Q50 43 55 30Q66 33 66 45M71 36Q84 35 85 26Q74 25 71 36M80 51Q79 40 88 37Q91 46 80 51M91 43Q105 46 111 35Q98 32 91 43" fill="#B8C2A4" fillOpacity="0.55"/>
  </g>
  <g transform="translate(74 20)" stroke={color} strokeWidth="0.9" fill={color} fillOpacity="0.22">
   {[0,72,144,216,288].map(angle=><ellipse key={angle} cx="0" cy="-7" rx="5.5" ry="9" transform={`rotate(${angle})`}/>)}
   <circle r="3.6" fill="#D9BD78" fillOpacity="1" stroke="none"/>
  </g>
  <path d="M31 46C8 32 19 20 29 30C40 15 52 30 31 46Z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08"/>
  {rich && <g fill={color} fillOpacity="0.4"><circle cx="8" cy="50" r="2"/><circle cx="43" cy="13" r="2"/><path d="M108 13c-10-8-13 1-7 5l7 5 7-5c6-4 3-13-7-5Z"/></g>}
 </svg>;
}
