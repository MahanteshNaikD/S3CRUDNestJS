import {
  Body,
  Controller,
  Post,
  UseGuards,
  Headers,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { FileService } from './file.service';
import { AuthGuard } from 'src/Auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { fileDto } from 'src/Dtos/userDto';

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @ApiHeader({ name: 'x-access-token' })
  @ApiOperation({ summary: 'Create Bucket' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bucket: {
          type: 'string',
          example: 'Bucket',
          description: 'User Bucket',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Bucket Created Successfull' })
  @ApiResponse({
    status: 400,
    description: 'Bucket Already Present for The User',
  })
  @ApiResponse({ status: 500, description: 'Bucket Created Unsuccessfull' })
  @UseGuards(AuthGuard)
  @Post('createBucket')
  async createBucket(@Body() bodyInput: fileDto, @Headers() header) {
    return this.fileService.createBucket(bodyInput, header);
  }

  @ApiHeader({ name: 'x-access-token' })
  @ApiOperation({ summary: 'Get All Bucket of User with pagination' })
  @ApiQuery({
    name: 'page',
    type: 'string',
    example: '1',
    description: 'page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'integer',
    example: '5',
    description: 'limit data per page',
  })
  @ApiResponse({ status: 200, description: 'All Bucket of The User' })
  @UseGuards(AuthGuard)
  @Get('getAllBucketOfUser')
  async getAllBucketList(
    @Query('page') page: any,
    @Query('limit') limit: any,
    @Headers() header,
  ) {
    return this.fileService.getAllBucketList(page, limit, header);
  }

  @ApiHeader({ name: 'x-access-token' })
  @ApiOperation({ summary: 'Upload any file in formData with bucket name' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        bucket: {
          type: 'string',
          example: 'bucket name',
          description: 'bucket name for storing file',
        },
        file: {
          type: 'file',
          example: 'exmaple.txt',
          description: 'upload any file',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Bucket Not Found For The User' })
  @ApiResponse({ status: 400, description: 'File Already Present' })
  @ApiResponse({ status: 201, description: 'File Upload Successfull' })
  @ApiResponse({ status: 500, description: 'File Upload Unsuccessfull' })
  @ApiResponse({ status: 400, description: 'If more then one file  "message:"Too many files"' })
  @ApiResponse({ status: 413, description: 'If file size is more then 500MB  "message:"File too large"' })
  @UseGuards(AuthGuard)
  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('file',{
    limits:{fileSize:500 * 1024 * 1024,files:1},
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() bodyInput: fileDto,
    @Headers() header,
  ) {
    return this.fileService.uploadFile(file, bodyInput, header);
  }

  @ApiHeader({ name: 'x-access-token' })
  @ApiOperation({
    summary: 'GetObject or File by giving bucket name and file name',
  })
  @ApiQuery({
    name: 'bucket',
    type: 'string',
    example: 'bucket name',
    description: 'bucket name for stored file',
  })
  @ApiQuery({
    name: 'file',
    type: 'string',
    example: 'exmaple',
    description: 'give file name',
  })
  @ApiResponse({ status: 404, description: 'Bucket Not Found' })
  @ApiResponse({ status: 200, description: 'File Streaming' })
  @ApiResponse({ status: 404, description: 'File Not Found' })
  @UseGuards(AuthGuard)
  @Get('streamFile')
  async streamFile(
    @Res({ passthrough: true }) res,
    @Query('bucket') bucket: fileDto,
    @Query('file') file: string,
    @Headers() header,
  ): Promise<StreamableFile> {
    const output = await this.fileService.streamFile(bucket, file, header);
    if (output.statusCode === 200) {
      res.set({
        'Content-Type': `application/${output.fileType}`,
        'Content-Disposition': `attachment; filename=${output.fileName}`,
      });
      res.setHeader('Transfer-Encoding', 'chunked');
      const file = createReadStream(output.file);
      return new StreamableFile(file);
    } else {
      res.send(output);
    }
  }

  @ApiHeader({ name: 'x-access-token' })
  @ApiOperation({ summary: 'Delete file from Bucket' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bucket: {
          type: 'string',
          example: 'bucket name',
          description: 'bucket name for storing file',
        },
        file: {
          type: 'file',
          example: 'exmaple',
          description: 'give file name',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Missing Required Fileds' })
  @ApiResponse({ status: 404, description: 'File Not Found' })
  @ApiResponse({ status: 400, description: 'Bucket Already Deleted' })
  @ApiResponse({ status: 200, description: 'File Delete Successfull' })
  @ApiResponse({ status: 500, description: 'Error In File Deletion' })
  @ApiHeader({ name: 'x-access-token' })
  @UseGuards(AuthGuard)
  @Post('deleteFile')
  async deleteFile(@Body() bodyInput: fileDto, @Headers() header) {
    return this.fileService.deleteFile(bodyInput, header);
  }

  @ApiHeader({ name: 'x-access-token' })
  @ApiOperation({ summary: 'Get files from Bucket' })
  @ApiQuery({
    name: 'bucket',
    type: 'string',
    example: 'bucket name',
    description: 'bucket name for storing file',
  })
  @ApiResponse({ status: 404, description: 'Missing Required Fileds' })
  @ApiResponse({ status: 400, description: 'Bucket Not Found for User' })
  @ApiResponse({ status: 404, description: 'Files Not Found' })
  @ApiResponse({ status: 200, description: 'Files Found', isArray: true })
  @UseGuards(AuthGuard)
  @Get('getAllFiles')
  async getAllFiles(@Query('bucket') bucket: fileDto, @Headers() header) {
    return this.fileService.getAllFiles(bucket, header);
  }

  @ApiOperation({ summary: 'Delete Bucket' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bucket: {
          type: 'string',
          example: 'bucket name',
          description: 'bucket name for storing file',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Missing Required Fileds' })
  @ApiResponse({ status: 400, description: 'Bucket Not Found for User' })
  @ApiResponse({ status: 404, description: 'Bucket Already Deleted' })
  @ApiResponse({ status: 200, description: 'Deleting Bucket Successfull' })
  @ApiResponse({ status: 500, description: 'Error at Deleting Bucket' })
  @ApiHeader({ name: 'x-access-token' })
  @UseGuards(AuthGuard)
  @Post('deleteBucket')
  async deleteBucket(@Body() bodyInput: fileDto, @Headers() header) {
    return this.fileService.deleteBucket(bodyInput, header);
  }
}
