import 'dotenv/config';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { AppError } from '../errors/appError.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const Extensions: readonly string[] = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'mp3',
  'wav',
  'ogg',
  'm4a',
  'aac',
  'flac',
  'mp4',
  'mov',
  'mkv',
];

export const mimeTypes: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
  'audio/flac',
  'video/mp4',
  'video/quicktime',
  'video/x-matroska',
];

export const maxSize: number = 20 * 1024 * 1024; // 20 MB

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const entity_type =
      (req.query.entity_type as string) || (req.body?.entity_type as string) || 'general';

    const validEntityType = /^[a-z0-9_]{2,64}$/.test(entity_type);
    if (!validEntityType) {
      throw new AppError('Invalid entity type.', 422);
    }

    const uuid = uuidv4();
    (req as any).fileUuid = uuid;

    let resource_type = 'auto';
    if (file.mimetype.startsWith('video/')) resource_type = 'video';
    if (file.mimetype.startsWith('audio/')) resource_type = 'raw';

    return {
      folder: `uploads/${entity_type}`,
      public_id: uuid,
      resource_type: resource_type,
    };
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!mimeTypes.includes(file.mimetype)) {
    return cb(new AppError('Invalid file type.', 422));
  }

  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (!Extensions.includes(ext)) {
    return cb(new AppError('Invalid file extension.', 422));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});

export const uploadSingleFile = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('file')(req, res, (err: any) => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 20MB.', 422));
    }
    if (err) {
      return next(new AppError(err.message || 'Upload failed.', 422));
    }
    return next();
  });
};

export const uploadLogo = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('logo')(req, res, (err: any) => {
    if (!req.file && !err) return next();
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 20MB.', 422));
    }
    if (err) {
      return next(new AppError(err.message || 'Upload failed.', 422));
    }
    next();
  });
};

export const uploadImage = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('image')(req, res, (err: any) => {
    if (!req.file && !err) return next();
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 20MB.', 422));
    }
    if (err) {
      return next(new AppError(err.message || 'Upload failed.', 422));
    }
    next();
  });
};
