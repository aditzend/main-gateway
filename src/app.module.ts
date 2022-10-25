import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConcordiaModule } from './concordia/concordia.module';
import { VoicebotModule } from './voicebot/voicebot.module';
import { FiltersService } from './filters/filters.service';

ConfigModule.forRoot();

@Module({
  imports: [ConcordiaModule, VoicebotModule],
  providers: [FiltersService],
})
export class AppModule {}
