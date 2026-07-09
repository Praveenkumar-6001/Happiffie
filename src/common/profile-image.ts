import { BadRequestException } from '@nestjs/common';

export const PROFILE_IMAGE_FIELD = 'profilePhoto';
export const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const WORK_IMAGE_FIELD = 'image';
export const WORK_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface UploadedProfileImage {
  buffer: Buffer;
  mimetype: string;
}

interface IncomingProfileImage {
  mimetype: string;
}

export function profileImageFileFilter(
  _request: unknown,
  file: IncomingProfileImage,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!allowedImageTypes.has(file.mimetype)) {
    callback(new BadRequestException('Only JPG, PNG, and WebP profile images are allowed.'), false);
    return;
  }

  callback(null, true);
}

export function profileImageToDataUrl(file?: UploadedProfileImage) {
  if (!file) {
    throw new BadRequestException('profilePhoto file is required.');
  }

  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}
