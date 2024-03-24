import { JwtService } from '@nestjs/jwt';
import { Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileStore } from 'src/Models/File';
import * as fs from 'fs';
import path, { join } from 'path';
import { FileDetails } from 'src/Models/FileDetails';

@Injectable()
export class FileService {
  constructor(
    @InjectModel('FileStore') private fileService: Model<FileStore>,
    @InjectModel('FileDetails') private fileDetails: Model<FileDetails>,
    private jwtService: JwtService,
  ) {}

  async validate(token: any):Promise<any> {
    const decoded = await this.jwtService.verify(token);
    return decoded;
  }

  async createBucket(bodyInput: any, headers: any):Promise<any>  {
    const user = await this.validate(headers['x-access-token']);
    let userFileName = `${bodyInput.bucket + user.userName}`;
    let folderName = `./S3/${userFileName}`;

    let findBcket = await this.fileService.findOne({
      bucket: userFileName,
      user: user.userName,
    });
    if (findBcket) {
      return {
        message: 'Bucket Already Present for The User',
        statusCode: 400,
      };
    }
    try {
      if (fs.existsSync(folderName)) {
        return {
          message: 'Bucket Already Present for The User',
          statusCode: 400,
        };
      } else {
        fs.mkdirSync(folderName);
        let relativePath = fs.realpathSync(folderName);
        let createData = await this.fileService.create({
          bucket: userFileName,
          user: user.userName,
          folderPath: relativePath,
        });
        if (createData) {
          return {
            message: 'Bucket Created Successfull',
            statusCode: 201,
          };
        }
      }
    } catch (err) {
      return {
        message: 'Bucket Created Unsuccessfull',
        statusCode: 500,
      };
    }
  }

  async getAllBucketList(page: any,limit:any, headers: any):Promise<any>  {
    const user = await this.validate(headers['x-access-token']);
    const skip = (page - 1) * limit;
    if (!limit) {
      limit = 10;
    }
    if (!page) {
      page = 1;
    }

    let findAllBucket = await this.fileService
      .find({ user: user.userName }, { bucket: 1, _id: 0 })
      .skip(skip)
      .limit(limit);

    for (let val of findAllBucket) {
      if (val.bucket.includes(user.userName)) {
        let bucketName = val.bucket.split(user.userName);
        val.bucket = bucketName[0];
      }
    }

    return {
      message: 'All Bucket of The User',
      data: findAllBucket,
      statusCode: 200,
    };
  }

  async uploadFile(file: any, bodyData: any, headres: any):Promise<any>  {
    let { bucket } = bodyData;
    const user = await this.validate(headres['x-access-token']);
    let userFileName = `${bucket + user.userName}`;
    let findUser = await this.fileService.findOne({ bucket: userFileName });
    if (!findUser) {
      return {
        message: 'Bucket Not Found For The User',
        statusCode: 404,
      };
    }

    let folderName = `./S3/${userFileName}`;
    if (!fs.existsSync(folderName)) {
      return {
        message: 'Bucket Not Found For The User',
        statusCode: 404,
      };
    }
    let PathOfFolder = fs.realpathSync(folderName);
    let originalFile = join(PathOfFolder, file.originalname);
    try {
      let presentFile = findUser.files.find(
        (value) => value.fileName === file.originalname.split('.')[0],
      );
      if (presentFile) {
        return {
          message: 'File Already Present',
          statusCode: 400,
        };
      }

      fs.writeFileSync(originalFile, file.buffer);
      let obj = {};
      obj['fileName'] = file.originalname.split('.')[0]
      obj['filePath'] = originalFile
      obj['fileType'] = file.mimetype
      obj['fileSize'] = file.size
      await this.fileService.findOneAndUpdate(
        { bucket: userFileName },
        {
          $push: {
            files: obj,
          },
        },
      );

      return {
        message: 'File Upload Successfull',
        statusCode: 201,
      };
    } catch (err) {
      return {
        message: 'File Upload Unsuccessfull',
        statusCode: 500,
      };
    }
  }

  async streamFile(bucket: any, file:any, headres: any): Promise<any> {
    const user = await this.validate(headres['x-access-token']);
    let userFileName = `${bucket + user.userName}`;
    let findFile = await this.fileService.findOne({
      bucket: userFileName,
      user: user.userName,
    });
    if (!findFile) {
      return {
        message: 'Bucket Not Found ',
        statusCode: 404,
      };
    }
    if (!fs.existsSync(findFile.folderPath)) {
      return {
        message: 'Bucket Not Found',
        statusCode: 404,
      };
    }

    let filePresent = findFile.files.find((value) => value.fileName === file);
    if (!filePresent) {
      return {
        message: 'File Not Found',
        statusCode: 404,
      };
    }

    return {
      fileName:filePresent.fileName,
      file: filePresent.filePath,
      fileType: filePresent.fileType,
      statusCode: 200,
    };
  }

  async deleteFile(bodyData: any, headres: any):Promise<any>  {
    let { bucket, file } = bodyData;
    if (!bucket || !file) {
      return {
        message: 'Missing Required Fileds',
        statusCode: 404,
      };
    }
    const user = await this.validate(headres['x-access-token']);
    let userFileName = `${bucket + user.userName}`;
    let findFile = await this.fileService.findOne({
      bucket: userFileName,
      user: user.userName,
    });

    if (!findFile) {
      return {
        message: 'Bucket Already Deleted',
        statusCode: 400,
      };
    }
    if (!fs.existsSync(findFile.folderPath)) {
      return {
        message: 'Bucket Already Deleted',
        statusCode: 400,
      };
    }

    let filePresent = findFile.files.find((value) => value.fileName === file);
    if (!filePresent) {
      return {
        message: 'File Not Found',
        statusCode: 404,
      };
    }

    try {
      fs.unlinkSync(filePresent.filePath);
      await this.fileService.updateOne(
        {
          bucket: userFileName,
          user: user.userName,
        },
        {
          $pull: {
            files: filePresent,
          },
        },
      );
      return {
        message: 'File Delete Successfull',
        statusCode: 200,
      };
    } catch (err) {
      return {
        message: 'Error In File Deletion',
        statusCode: 500,
      };
    }
  }

  async getAllFiles(bucket: any, headres: any):Promise<any>  {
    if (!bucket) {
      return {
        message: 'Missing Required Fileds',
        statusCode: 404,
      };
    }
    const user = await this.validate(headres['x-access-token']);
    let userFileName = `${bucket + user.userName}`;
    let findFile = await this.fileService.findOne({
      bucket: userFileName,
      user: user.userName,
    });

    if (!findFile) {
      return {
        message: 'Bucket Not Found for User',
        statusCode: 400,
      };
    }

    let filePresent = findFile.files.map((value) => value.fileName);

    if (filePresent.length===0) {
      return {
        message: 'Files Not Found',
        statusCode: 404,
      };
    } else {
      return {
        message: 'Files Found',
        files: filePresent,
        statusCode: 200,
      };
    }
  }

  async deleteBucket(bodyData:any,headres:any):Promise<any>{
    let { bucket } = bodyData;
    if (!bucket) {
      return {
        message: 'Missing Required Fileds',
        statusCode: 404,
      };
    }
    const user = await this.validate(headres['x-access-token']);
    let userFileName = `${bucket + user.userName}`;
    let findFile = await this.fileService.findOne({
      bucket: userFileName,
      user: user.userName,
    });

    if (!findFile) {
      return {
        message: 'Bucket Not Found for User',
        statusCode: 400,
      };
    }

    if (!fs.existsSync(findFile.folderPath)) {
      return {
        message: 'Bucket Already Deleted',
        statusCode: 400,
      };
    }
    try {
     fs.promises.rm(findFile.folderPath,{recursive:true,force:true})
     await this.fileService.deleteOne( {
      bucket: userFileName,
      user: user.userName,
    })
     return {
      message:"Deleting Bucket Successfull",
      statusCode:200
    }
    }catch(err){
      return {
        message:"Error at Deleting Bucket",
        statusCode:500
      }
    }

  }
}
