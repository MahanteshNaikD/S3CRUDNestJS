import { Injectable } from '@nestjs/common';
import  * as AWS from 'aws-sdk'

const S3 = new AWS.S3({
    credentials:{
        accessKeyId:'',
        secretAccessKey:'',
    },
    region:'ap-south-1'
})

@Injectable()
export class S3FileService {
  getHello(): string {
    return 'Hello World!';
  }


  async createS3Bucket(input:any){
      const params = {
        Bucket:'mahantesh-bucket-1'
      }
      S3.createBucket(params,(err,data)=>{
        if (err) {
            console.log(err, err.stack);
          } else {
            console.log('Bucket created successfully',data);
           
          }
      })

      return {
        message:'Bucket Created Successfully'
    }
  }


  async deleteBucket(input:any){
    const params = {
        Bucket:'mahantesh-bucket-1'
      }
      S3.deleteBucket(params,(err,data)=>{
        if (err) {
            console.log(err, err.stack);
          } else {
            console.log('Bucket created successfully',data);
           
          }
      })

      return {
        message:'Bucket Delete Successfully'
    }
  }

  async uploadFlleToS3(file:any,input:any){

    console.log(file)

    const params = {
        Bucket:'mahantesh-bucket-1',
        Key:file.originalname,
        Body:file.buffer
    }

    try{
         S3.upload(params,(err,data)=>{
            if (err) {
                console.log("Error", err);
              }
              if (data) {
                console.log("Upload Success", data.Location);
              }
        })
    }catch(err){
        return {
            message:err
        }
    }

    return {
        message:"File Upload Successfull"
    }

  }


  async getFileFromS3(input:any){
    const params = {
        Bucket:'mahantesh-bucket-1',
        Key:'_A1 BACKEND UPDATED.pdf',
    }


    const s3File = S3.getSignedUrl('getObject',{
        Bucket:'mahantesh-bucket-1',
        Key:'_A1 BACKEND UPDATED.pdf',
        Expires:60
    })


    return {
        message:s3File
    }
  }

  async deleteFileFromS3(fileName:any){
    const params = {
        Bucket:'mahantesh-bucket-1',
        Key:'_A1 BACKEND UPDATED.pdf',
    }


    try{
        S3.deleteObject(params,(err,data)=>{
            if(err){
                console.log(err.stack)
            }else {
                console.log(data)
            }
        })
    }catch(err){
       console.log(err)
    }
   


    return {
        message:"File Delete Successfully"
    }
  }
}
