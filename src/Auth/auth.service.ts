import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../UserModule/user.service';
import * as becypt from 'bcryptjs';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    if (!user) {
      return {
        message: 'User Not Found',
        statusCode: 404,
      };
    }

    const passwordMatch = await becypt.compare(pass, user.password);
    if (!passwordMatch) {
      return {
        message: 'Password Not Matched',
        statusCode: 404,
      };
    }
    const payload = { userName: user.userName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
