import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './Auth/auth.module';
import { FileModule } from './filemodule/file.module';
import { S3FileModule } from './S3Folder/s3.folder.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/FileStorage'),
    AuthModule,
    FileModule,
    S3FileModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
