import { ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  private s3Client: S3Client;

  constructor(private readonly config: ConfigService) {
    this.s3Client = new S3Client({
      region: config.get('AWS.S3.REGION')!,
      credentials: {
        accessKeyId: config.get('AWS.S3.ACCESS_KEY_ID')!,
        secretAccessKey: config.get('AWS.S3.SECRET_ACCESS_KEY')!,
      },
    });
  }

  public async uploadToS3(files: Array<Express.Multer.File & { extension: string; objectKey: string }>) {
    return await Promise.allSettled(
      files.map((file) =>
        this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.config.get('AWS.S3.BUCKET_NAME')!,
            Key: `attachments/${file.objectKey}${file.extension}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
              OriginalName: file.originalname,
            },
          }),
        ),
      ),
    )
      .then((result) =>
        result.map((e, i) => {
          return {
            success: e.status === 'fulfilled',
            url:
              e.status === 'fulfilled'
                ? `https://${this.config.get('AWS.S3.BUCKET_NAME')!}.s3.${this.config.get(
                    'AWS.S3.REGION',
                  )!}.amazonaws.com/attachments/${files[i].objectKey}${files[i].extension}`
                : null,
          };
        }),
      )
      .catch((e) => {
        throw new InternalServerErrorException({
          code: '000-000',
          title: 'Internal Server Error',
          message: 'Failed to upload files to Storage.',
        });
      });
  }
}
