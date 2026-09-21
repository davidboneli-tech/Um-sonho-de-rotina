async function jpeg(blob: Blob): Promise<string> {
  const url = URL.createObjectURL(blob);
  try {
    const image = new window.Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Formato não reconhecido pelo navegador.'));
      image.src = url;
    });
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar a foto.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let result = canvas.toDataURL('image/jpeg', 0.8);
    if (result.length > 800000) result = canvas.toDataURL('image/jpeg', 0.55);
    if (!result.startsWith('data:image/jpeg;base64,') || result.length > 1500000) throw new Error('A foto ficou muito grande. Selecione uma imagem menor.');
    return result;
  } finally { URL.revokeObjectURL(url); }
}

export async function normalizeMedicinePhoto(file: File): Promise<string> {
  if (file.size > 25 * 1024 * 1024) throw new Error('Escolha uma foto de até 25 MB.');
  try { return await jpeg(file); } catch {
    // Safari can decode some HEIC files natively; use the bundled local decoder otherwise.
    const { isHeic, heicTo } = await import('heic-to/csp');
    if (!await isHeic(file)) throw new Error('Não foi possível abrir esta foto. Escolha uma imagem HEIC, JPEG, PNG ou WebP válida.');
    try {
      const converted = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.8 });
      return await jpeg(converted as Blob);
    } catch { throw new Error('Não foi possível converter esta foto HEIC. Tente outra foto da embalagem.'); }
  }
}

export function pickMedicinePhoto(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*,.heic,.heif';
    input.style.display = 'none'; document.body.appendChild(input);
    input.oncancel = () => { input.remove(); resolve(null); };
    input.onchange = async () => {
      const file = input.files?.[0]; input.remove();
      if (!file) { resolve(null); return; }
      try { resolve(await normalizeMedicinePhoto(file)); } catch (e) { reject(e); }
    };
    input.click();
  });
}
