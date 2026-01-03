import { Module } from '@nestjs/common';
import { AppController } from '@src/app.controller';
import { AppService } from '@src/app.service';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { VideoModule } from '@modules/video/video.module';
import { ChatModule } from '@modules/chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@vendors/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigService available globally
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VideoModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
