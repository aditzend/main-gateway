import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BotsService } from 'src/bots/bots.service';
import { FiltersService } from 'src/filters/filters.service';
import { VoicebotController } from './voicebot.controller';

@Module({
  imports: [HttpModule],
  controllers: [VoicebotController],
  providers: [BotsService, FiltersService],
})
export class VoicebotModule {}
