import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class FileDetails {
    @Prop()
    fileName : string

    @Prop()
    fileSize : string

    @Prop()
    fileType : string

    @Prop()
    filePath : string
}


export const FileDetailsSchema = SchemaFactory.createForClass(FileDetails);