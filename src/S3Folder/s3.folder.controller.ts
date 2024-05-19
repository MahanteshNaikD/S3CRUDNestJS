import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { S3FileService } from './s3.folder.service';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('S3File')
export class S3FileController {
  constructor(private readonly s3FileService: S3FileService) {}

  @Get()
  getHello(): string {
    return this.s3FileService.getHello();
  }


  @Post('createS3Bucket')
  createS3Bucket(@Body() input:any){
    return this.s3FileService.createS3Bucket(input)
  }


  @Post('deleteBucket')
  deleteBucket(@Body() input:any){
    return this.s3FileService.deleteBucket(input)

  }


  @Post('uploadFlleToS3')
  @UseInterceptors(FileInterceptor('file',{
    limits:{fileSize:500 * 1024 * 1024,files:1},
  }))
  uploadFlleToS3( @UploadedFile() file: Express.Multer.File,@Body() input:any){
      return this.s3FileService.uploadFlleToS3(file,input);
  }


  @Get('getFileFromS3')
  getFileFromS3(@Query('fileName') fileName:string){
    return this.s3FileService.getFileFromS3(fileName)
  }

  @Post('deleteFileFromS3')
  deleteFileFromS3(@Body() fileName:any){
    return this.s3FileService.deleteFileFromS3(fileName)
  }
}
