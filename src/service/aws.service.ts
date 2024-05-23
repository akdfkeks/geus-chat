import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ER from 'src/common/error/rest/expected';
import { ErrorUtil } from 'src/common/util/error.util';
import { FileUtil } from 'src/common/util/file.util';

@Injectable()
export class AwsService {
  private s3Client: S3Client;

  constructor(private readonly config: ConfigService) {
    this.s3Client = new S3Client({
      region: config.get('AWS_S3_REGION')!,
      credentials: {
        accessKeyId: config.get('ACCESS_KEY_ID')!,
        secretAccessKey: config.get('SECRET_ACCESS_KEY')!,
      },
    });
  }

  public async uploadImageToS3(files: Array<Express.Multer.File & { objectKey: string }>) {
    return await Promise.allSettled(
      files.map((file) =>
        this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.config.get('AWS_S3_BUCKET')!,
            Key: file.objectKey,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        ),
      ),
    )
      .then((result) =>
        result.map((e, i) => {
          return {
            key: files[i].objectKey,
            result:
              e.status === 'fulfilled'
                ? {
                    origin: FileUtil.keyToS3ObjectURL(files[i].objectKey),
                    resized: FileUtil.keyToS3ObjectURL(files[i].objectKey, {
                      bucket: this.config.get('AWS_S3_BUCKET_RESIZED'),
                    }),
                  }
                : null,
          };
        }),
      )
      .catch((e) => {
        throw ErrorUtil.internal(ER.FILES_UPLOAD_FAILED_UNKNOWN);
      });
  }
}
