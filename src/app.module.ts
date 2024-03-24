import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './Auth/auth.module';
import { FileModule } from './filemodule/file.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/FileStorage'),
    AuthModule,
    FileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
