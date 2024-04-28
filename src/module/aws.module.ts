import { Module } from '@nestjs/common';
import { AwsService } from 'src/service/aws.service';

@Module({
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
