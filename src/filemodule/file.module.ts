import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema } from 'src/Models/File';
import { FileDetailsSchema } from 'src/Models/FileDetails';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'FileStore',
        schema: FileSchema,
      },
      {
        name:'FileDetails',
        schema:FileDetailsSchema
      }
    ]),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
