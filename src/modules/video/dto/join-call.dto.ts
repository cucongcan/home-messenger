import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinCallDto {
  @ApiProperty({ example: 'uuid-conversation-id', description: 'The ID of the conversation to join' })
  @IsString()
  @IsNotEmpty()
  conversationId: string;
}
