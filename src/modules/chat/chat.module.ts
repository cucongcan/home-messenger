import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway'; // Adjusted path
import { ChatService } from './chat.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@vendors/prisma/prisma.module';

@Module({
  imports: [JwtModule, PrismaModule],
  providers: [ChatGateway, ChatService, WsJwtGuard],
})
export class ChatModule {}
