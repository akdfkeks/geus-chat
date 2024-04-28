import * as path from 'path';
import { ulid } from 'ulidx';

export namespace FileUtil {
  export const toUploadable = (files: Express.Multer.File | Array<Express.Multer.File>) =>
    (Array.isArray(files) ? files : [files]).map((file) => {
      return { ...file, objectKey: ulid(), extension: path.extname(file.originalname) };
    });
  export const isOversized = (file: Omit<Express.Multer.File, 'stream'>, maxBytes: number) => {
    return file.size > maxBytes;
  };
  export const isImage = (file: Omit<Express.Multer.File, 'stream'>) => {
    return new RegExp(/^image\/(jpg|jpeg|png|webp|gif|bmp)$/).test(file.mimetype);
  };
}
