import { FilesInterceptor } from '@nestjs/platform-express';
import { ErrorUtil } from 'src/common/util/error.util';
import { FileUtil } from 'src/common/util/file.util';
import * as multer from 'multer';
import * as ER from 'src/common/error/rest/expected';

export const ImagesInterceptor = FilesInterceptor('files', 10, {
  storage: multer.memoryStorage(), // it can cause out of memory
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (FileUtil.isOversized(file, 5 * 1024 * 1024)) {
      throw ErrorUtil.badRequest(ER.FILES_ARE_OVERSIZED);
    }

    if (!FileUtil.isImage(file)) {
      throw ErrorUtil.badRequest(ER.FILES_ARE_UNSUP_TYPE);
    }

    // 한글 파일명 파싱 관련 문제
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf-8');

    cb(null, true);
  },
});
