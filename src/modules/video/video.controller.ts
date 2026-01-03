import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { VideoService } from './video.service';
import { AuthGuard } from '@nestjs/passport';
import { JoinCallDto } from './dto/join-call.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Video')
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('join-call')
  @ApiOperation({ summary: 'Join a video call' })
  @ApiResponse({ status: 200, description: 'LiveKit token generated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @HttpCode(HttpStatus.OK)
  joinCall(
    @Request() req,
    @Body() joinCallDto: JoinCallDto,
  ) {
    const userId = req.user.id;
    const username = req.user.username;
    const { conversationId } = joinCallDto;
    
    return this.videoService.generateLiveKitToken(userId, username, conversationId);
  }
}
