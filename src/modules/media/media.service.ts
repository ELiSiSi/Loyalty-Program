import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env.js';
import { BadRequestError } from '../../errors/appError.js';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  IMediaUploadResult,
  MAX_FILE_SIZE_BYTES,
} from './media.types.js';

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export class MediaService {
  static validateFile(filename: string, mimetype: string, size?: number) {
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
      throw new BadRequestError(
        `Invalid file extension '.${ext}'. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(mimetype as any)) {
      throw new BadRequestError(`Invalid file mime type '${mimetype}'.`);
    }

    if (size && size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError('File too large. Maximum allowed size is 20MB.');
    }
  }

  static async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    mimetype: string,
    entityType: string = 'general'
  ): Promise<IMediaUploadResult> {
    this.validateFile(filename, mimetype, fileBuffer.length);

    const safeEntity = entityType.replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'general';
    const uuid = uuidv4();
    const ext = path.extname(filename).toLowerCase();
    const uniqueFilename = `${uuid}${ext}`;

    // 1. If Cloudinary credentials are provided, upload to Cloudinary CDN
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      return new Promise((resolve, reject) => {
        let resource_type: 'image' | 'video' | 'raw' | 'auto' = 'auto';
        if (mimetype.startsWith('video/')) resource_type = 'video';
        if (mimetype.startsWith('audio/') || mimetype === 'application/pdf') resource_type = 'raw';

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `loyalty_saas/${safeEntity}`,
            public_id: uuid,
            resource_type,
          },
          (error, result) => {
            if (error || !result) {
              return reject(new BadRequestError(`Cloudinary upload failed: ${error?.message || 'Unknown'}`));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              filename: uniqueFilename,
              mimetype,
              size: result.bytes,
            });
          }
        );

        uploadStream.end(fileBuffer);
      });
    }

    // 2. Local File System fallback
    const uploadsDir = path.resolve(process.cwd(), 'uploads', safeEntity);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, uniqueFilename);
    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      url: `/uploads/${safeEntity}/${uniqueFilename}`,
      filename: uniqueFilename,
      mimetype,
      size: fileBuffer.length,
    };
  }
}
