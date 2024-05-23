import * as path from 'path';
import { ulid } from 'ulidx';

export namespace FileUtil {
  export const toUploadable = (
    files: Express.Multer.File | Array<Express.Multer.File>,
    option?: {
      prefix?: string;
    },
  ) => {
    return (Array.isArray(files) ? files : [files]).map((file) => {
      return { ...file, objectKey: `${option?.prefix ?? ''}${ulid()}${path.extname(file.originalname)}` };
    });
  };

  export const isOversized = (file: { size: number }, maxBytes: number) => {
    return file.size > maxBytes;
  };

  export const isImage = (file: { mimetype: string }) => {
    return new RegExp(/^image\/(jpg|jpeg|png|webp|gif|bmp)$/).test(file.mimetype);
  };

  export const keyToS3ObjectURL = (
    objectKey: string,
    option?: {
      bucket?: string;
      region?: string;
    },
  ) => {
    return `https://${option?.bucket ?? process.env.AWS_S3_BUCKET}.s3.${
      option?.region ?? process.env.AWS_S3_REGION
    }.amazonaws.com/${objectKey}`;
  };
}
