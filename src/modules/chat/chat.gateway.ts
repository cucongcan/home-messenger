import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      username: string;
    };
  };
}

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*', // Adjust for production
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway Initialized');
  }

  handleConnection(client: AuthenticatedSocket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id} | User: ${client.data.user.username}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id} | User: ${client.data.user.username}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() room: string, // room is the conversationId
  ) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() room: string,
  ) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    client.emit('leftRoom', room);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId: string; content: string },
  ): Promise<void> {
    const senderId = client.data.user.id;
    const { conversationId, content } = payload;

    const message = await this.chatService.createMessage(
      senderId,
      conversationId,
      content,
    );
    
    // Broadcast to the room
    this.server.to(conversationId).emit('newMessage', message);
    this.logger.log(`Message sent by ${senderId} to room ${conversationId}`);
  }
}
