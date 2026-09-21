import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
export function NavIcon({name,size,color}:{name:any;size:number;color:string}) {
 return <Ionicons name={name} size={size} color={color} />;
}
