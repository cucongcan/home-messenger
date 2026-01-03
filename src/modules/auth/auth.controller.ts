import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.signUp(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }

  // This is a protected route, just for demonstration
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Request() req) {
    return req.user;
  }
}
