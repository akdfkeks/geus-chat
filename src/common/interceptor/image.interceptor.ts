import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { FileUtil } from 'src/common/util/file.util';

export const ImagesInterceptor = FilesInterceptor('files', 10, {
  storage: multer.memoryStorage(), // it can cause out of memory
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (FileUtil.isOversized(file, 5 * 1024 * 1024)) {
      throw new BadRequestException({
        code: '000-000',
        title: '사진 전송에 실패했습니다.',
        message: '5MB 이하의 파일만 전송할 수 있습니다.',
      });
    }

    if (!FileUtil.isImage(file)) {
      new BadRequestException({
        code: '000-000',
        title: '사진 전송에 실패했습니다.',
        message: '지원되지 않는 형식입니다.',
      });
    }

    cb(null, true);
  },
});
