import React from 'react';
const paths: Record<string,string> = {
 'home-outline': 'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',
 'calendar-outline': 'M5 5h14v16H5zM8 3v4m8-4v4M5 10h14M8 14h2m4 0h2m-8 4h2m4 0h2',
 'list-outline': 'M9 6h12M9 12h12M9 18h12M3 5l1 1 2-2M3 11l1 1 2-2M3 17l1 1 2-2',
 'flag-outline': 'M5 22V3m0 1c5-4 9 4 15 0v11c-6 4-10-4-15 0',
 'settings-outline': 'M3 6h5m4 0h9M3 12h10m4 0h4M3 18h3m4 0h11M8 3v6m5 0v6M6 15v6',
};
export function NavIcon({name,size,color}:{name:string;size:number;color:string}) {
 return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name] || paths['home-outline']} /></svg>;
}
