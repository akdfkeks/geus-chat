import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import { FileUtil } from 'src/common/util/file.util';
import { Wrapper } from 'src/common/util/wrapper';

export const ChatMediaInterceptor = FilesInterceptor('attachments', 10, {
  storage: multer.memoryStorage(), // it can cause out of memory
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    FileUtil.isOversized(file, 8 * 1024 * 1024)
      ? cb(
          new BadRequestException({
            code: '000-000',
            title: '파일 전송에 실패했습니다.',
            message: '8MB 이하의 파일만 전송할 수 있습니다.',
          }),
          false,
        )
      : FileUtil.isImage(file)
        ? cb(null, true)
        : cb(
            new BadRequestException({
              code: '000-000',
              title: '파일 전송에 실패했습니다.',
              message: '지원되지 않는 파일 형식입니다.',
            }),
            false,
          );
  },
});
