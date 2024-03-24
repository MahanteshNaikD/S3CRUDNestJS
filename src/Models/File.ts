import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { FileDetails } from "./FileDetails";

@Schema()
export class FileStore {
    @Prop()
    bucket : string

    @Prop()
    files:Array<FileDetails>

    @Prop()
    folderPath : string

    @Prop()
    user:string
}


export const FileSchema = SchemaFactory.createForClass(FileStore);