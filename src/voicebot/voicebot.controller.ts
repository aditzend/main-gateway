import { Controller, Get, Logger, Post, Req } from '@nestjs/common';
import { BotsService } from 'src/bots/bots.service';
import { VoicebotV1MessageDto } from './dto/voicebot-v1-message.dto';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Controller('bot')
export class VoicebotController {
  constructor(private readonly botsService: BotsService) {}
  logger: Logger = new Logger('VoicebotController');
  @Get('version')
  async bot() {
    return this.botsService.version();
  }
  @Post()
  botPost(@Req() request: Request) {
    const voicebotMessage: VoicebotV1MessageDto = request.body;
    this.logger.debug(JSON.stringify(voicebotMessage));
    this.logger.debug(voicebotMessage.InteractionId);
    return this.botsService.sendVoicebotMessage(voicebotMessage);
  }
}
