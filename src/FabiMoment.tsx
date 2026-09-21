import React, { useEffect, useState } from 'react';
import { AppState, Image, View } from 'react-native';
import { Data } from './domain';
import { fabiScenes } from './assets';
import { Card, Txt } from './ui';
import { Moment, todayMoment } from './companion';

export function FabiMessage({ scene, title, body }: Moment) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 }}>
    <Image accessible={false} source={fabiScenes[scene]} resizeMode="contain" style={{ width: 76, height: 90, borderRadius: 14, flexShrink: 0 }} />
    <View style={{ flex: 1, minWidth: 0 }}>
      <Txt style={{ fontWeight: '700' }}>{title}</Txt>
      <Txt muted>{body}</Txt>
    </View>
  </View>;
}

export function FabiMoment({ data }: { data: Data }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const update = () => setNow(new Date());
    const timer = setInterval(update, 30000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') update(); });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []);
  const moment = todayMoment(data, now);
  return moment ? <Card alternate><FabiMessage {...moment} /></Card> : null;
}
