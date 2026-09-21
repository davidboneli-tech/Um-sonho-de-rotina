import React from 'react';
import { Text } from 'react-native';
export function Decoration({color,width=96,rich=false}:{color:string;width?:number;rich?:boolean}) {
 return <Text accessible={false} style={{color,fontSize:width*0.3,opacity:0.7}}>{rich?'❧ ❀ ♡':'❀ ♡'}</Text>;
}
