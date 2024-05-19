import { Module } from '@nestjs/common';
import { S3FileController } from './s3.folder.controller';
import { S3FileService } from './s3.folder.service';

@Module({
  imports: [
   
  ],
  controllers: [S3FileController],
  providers: [S3FileService],
})
export class S3FileModule {}
