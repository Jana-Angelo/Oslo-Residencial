import { supabase } from './supabaseClient';

const BUCKET_AVATARS = 'avatars';
const BUCKET_RECOMMENDATIONS = 'recomendacoes';

function compressImage(file: File, maxDim = 800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
      } else {
        if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context not available')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to compress image'));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = url;
  });
}

export const storageService = {
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const blob = await compressImage(file, 400, 0.8);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}_${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET_AVATARS)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

    if (error) {
      throw new Error(`Falha no upload do avatar: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET_AVATARS).getPublicUrl(path);
    if (!data?.publicUrl) {
      throw new Error('Falha ao obter URL pública do avatar');
    }
    return data.publicUrl;
  },

  async deleteAvatar(path: string): Promise<boolean> {
    const { error } = await supabase.storage.from(BUCKET_AVATARS).remove([path]);
    if (error) {
      console.error('Erro ao deletar avatar:', error);
      return false;
    }
    return true;
  },

  async uploadRecommendationImage(file: File): Promise<string> {
    const blob = await compressImage(file, 1200, 0.8);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET_RECOMMENDATIONS)
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

    if (error) {
      throw new Error(`Falha no upload da imagem: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET_RECOMMENDATIONS).getPublicUrl(path);
    if (!data?.publicUrl) {
      throw new Error('Falha ao obter URL pública da imagem');
    }
    return data.publicUrl;
  },

  async uploadRecommendationImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const url = await this.uploadRecommendationImage(file);
      urls.push(url);
    }
    return urls;
  },

  async deleteRecommendationImage(path: string): Promise<boolean> {
    const { error } = await supabase.storage.from(BUCKET_RECOMMENDATIONS).remove([path]);
    if (error) {
      console.error('Erro ao deletar imagem de recomendação:', error);
      return false;
    }
    return true;
  },
};
