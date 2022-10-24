import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BotsService } from 'src/bots/bots.service';
import { ConcordiaGateway } from './concordia.gateway';

@Module({
  imports: [HttpModule],
  providers: [ConcordiaGateway, BotsService],
})
export class ConcordiaModule {}
