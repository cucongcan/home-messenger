import { Injectable } from '@nestjs/common';
import { PrismaService } from '@vendors/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage(senderId: string, conversationId: string, content: string) {
    return this.prisma.message.create({
      data: {
        senderId,
        conversationId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getConversationParticipants(conversationId: string) {
    return this.prisma.participant.findMany({
      where: {
        conversationId,
      },
      select: {
        userId: true,
      },
    });
  }
}
