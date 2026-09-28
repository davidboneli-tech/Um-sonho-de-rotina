import { Touch as Pressable } from "./Touch";
import React, { useState } from 'react';
import { Image, Modal, View, ScrollView, AppState } from 'react-native';
import { Art, Button, Txt } from './ui';

export function EventArt({ event, size = 90, expandable = false }: { event: { image: number; photo?: string }; size?: number; expandable?: boolean }) {
  const [open, setOpen] = useState(false);
  React.useEffect(() => { const sub = AppState.addEventListener('change', s => { if (s !== 'active') setOpen(false); }); return () => sub.remove(); }, []);
  if (!event.photo) return <Art index={event.image} size={size} />;
  const photo = <Image source={{ uri: event.photo }} resizeMode="contain" style={{ width: size, height: size, borderRadius: 12 }} />;
  if (!expandable) return photo;
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Ampliar imagem do compromisso" onPress={() => setOpen(true)}>
      {photo}<Txt muted style={{ fontSize: 12, textAlign: 'center' }}>Ampliar</Txt>
    </Pressable>
    <Modal visible={open} onRequestClose={() => setOpen(false)} animationType="none">
      <View style={{ flex: 1, backgroundColor: '#FCF8F2', padding: 20, paddingTop: 50 }}>
        <Button outline onPress={() => setOpen(false)}>Fechar imagem</Button>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} maximumZoomScale={3} minimumZoomScale={1}>
          <Image source={{ uri: event.photo }} resizeMode="contain" style={{ width: '100%', flex: 1, minHeight: 420 }} />
        </ScrollView>
      </View>
    </Modal>
  </>;
}
