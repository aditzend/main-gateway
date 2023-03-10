import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BotsService } from 'src/bots/bots.service';
import { FiltersService } from 'src/filters/filters.service';
import { ConcordiaGateway } from './concordia.gateway';

@Module({
  imports: [HttpModule],
  providers: [ConcordiaGateway, BotsService, FiltersService],
})
export class ConcordiaModule {}
