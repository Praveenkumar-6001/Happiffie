const MAX_PROFILE_IMAGE_DIMENSION = 768;
const MAX_WORK_IMAGE_DIMENSION = 1280;
const PROFILE_IMAGE_QUALITY = 0.82;
const PROFILE_IMAGE_TYPE = 'image/jpeg';

export async function prepareProfileImage(file: File): Promise<File> {
  return prepareImage(file, MAX_PROFILE_IMAGE_DIMENSION, 'profile-photo');
}

export async function prepareWorkImage(file: File): Promise<File> {
  return prepareImage(file, MAX_WORK_IMAGE_DIMENSION, 'vendor-work');
}

async function prepareImage(file: File, maxDimension: number, fallbackName: string): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Image compression is not supported in this browser.');
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) {
          resolve(value);
          return;
        }
        reject(new Error('Could not compress image.'));
      },
      PROFILE_IMAGE_TYPE,
      PROFILE_IMAGE_QUALITY,
    );
  });

  const name = file.name.replace(/\.[^.]+$/, '') || fallbackName;
  return new File([blob], `${name}.jpg`, { type: PROFILE_IMAGE_TYPE });
}
