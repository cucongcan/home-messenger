import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';
import { PrismaService } from '@vendors/prisma/prisma.service';

@Injectable()
export class VideoService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async generateLiveKitToken(userId: string, username: string, conversationId: string): Promise<{ token: string }> {
    // 1. Verify user is a participant of the conversation
    const participant = await this.prisma.participant.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
    });

    if (!participant) {
      throw new UnauthorizedException('You are not a member of this conversation.');
    }

    // 2. Create LiveKit Access Token
    const roomName = conversationId;
    const participantName = username;
    const apiKey = this.config.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.config.get<string>('LIVEKIT_API_SECRET');

    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: participantName,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return { token };
  }
}
