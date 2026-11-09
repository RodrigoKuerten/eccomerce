export const MAX_IMAGE_SIZE = 5_000_000;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Use uma imagem JPG, PNG ou WebP.';
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'A imagem deve ter no máximo 5 MB.';
  }

  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(reader.error ?? new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}
