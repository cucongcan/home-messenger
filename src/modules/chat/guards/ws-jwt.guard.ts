import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '@vendors/prisma/prisma.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true }, // Select only necessary fields
      });

      if (!user) {
        throw new WsException('Unauthorized');
      }
      
      // Attach user to the socket object
      client.data.user = user;
    } catch (e) {
      this.logger.error(e.message);
      throw new WsException('Unauthorized');
    }

    return true;
  }

  private extractTokenFromHandshake(client: Socket): string | undefined {
    const token = client.handshake.headers.authorization?.split(' ')[1];
    return token;
  }
}
