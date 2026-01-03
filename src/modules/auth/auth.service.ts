import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@vendors/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          username,
          password: hashedPassword,
        },
      });

      // Exclude password from the returned object
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        throw new ConflictException('Email or username already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async signIn(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };
    return this.generateTokens(payload);
  }

  private async generateTokens(payload: { sub: string; username: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
