import * as ImagePicker from 'expo-image-picker';
export async function pickMedicinePhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.65, base64: true });
  if (result.canceled) return null;
  const photo = result.assets[0];
  if (!photo.base64 || photo.base64.length > 1400000) throw new Error('Escolha uma imagem menor.');
  return `data:image/jpeg;base64,${photo.base64}`;
}

