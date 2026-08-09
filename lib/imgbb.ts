const IMGBB_API_KEY = '50d495fd467c86f99ae94491d6cc7873';

export async function uploadToImgbb(base64Data: string): Promise<string> {
  const formData = new FormData();
  formData.append('key', IMGBB_API_KEY);
  formData.append('image', base64Data);

  const res = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Image upload failed');

  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Image upload failed');

  return data.data.url;
}
