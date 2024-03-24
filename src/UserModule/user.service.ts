import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as becypt from 'bcryptjs';

export type User = any;

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userService: Model<User>) {}

  async findOne(username: string): Promise<User | undefined> {
    const user = this.userService.findOne({ userName: username });
    return user;
  }

  async creteUser(deviceInput: any) {
    const saltRounds = 10;
    const { userName, password } = deviceInput;

    const find = await this.userService.findOne({ userName: userName });
    if (find) {
      return {
        message: 'User Already Present',
        statusCode: 201,
      };
    }
    const salt = await becypt.genSalt(saltRounds);
    const hashedPassword = await becypt.hash(password, salt);

    try {
      const user = await this.userService.create({
        userName: userName,
        password: hashedPassword,
      });

      if (user) {
        return {
          message: 'User Created Sccessfully',
          statusCode: 201,
        };
      }
    } catch (err) {
      return {
        message: 'Error Creating User',
        statusCode: 201,
      };
    }
  }
}
