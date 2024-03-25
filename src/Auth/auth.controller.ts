import { Body, Controller, Post} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../UserModule/user.service';
import { UserDto } from 'src/Dtos/userDto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}


  @ApiOperation({ summary: 'Create User' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userName: {
          type: 'string',
          example: 'Jhon Dao',
          description: 'userName',
        },
        password: {
          type: 'string',
          example: '********',
          description: 'password',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'User Already Present' })
  @ApiResponse({ status: 201, description: 'User Created Sccessfully' })
  @ApiResponse({ status: 500, description: 'Error Creating User' })
  @Post('createUser')
  createUser(@Body() deviceInput: UserDto) {
    return this.userService.creteUser(deviceInput);
  }

  @ApiOperation({ summary: 'LogIn User for x-access-token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userName: {
          type: 'string',
          example: 'Jhon Dao',
          description: 'userName',
        },
        password: {
          type: 'string',
          example: '********',
          description: 'password',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User Not Found' })
  @ApiResponse({ status: 404, description: 'Password Not Matched' })
  @ApiResponse({ status: 200, description: 'accessToken' })
  @Post('login')
  signIn(@Body() signInDto: UserDto) {
    return this.authService.signIn(signInDto.userName, signInDto.password);
  }



 
}
