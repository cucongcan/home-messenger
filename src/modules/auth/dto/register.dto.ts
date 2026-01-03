import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'username', description: 'The username of the user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user (min 8 chars)' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty()
  password: string;
}
