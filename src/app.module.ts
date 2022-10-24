import { Module } from '@nestjs/common';
import { ConcordiaModule } from './concordia/concordia.module';

@Module({
  imports: [ConcordiaModule],
  providers: [],
})
export class AppModule {}
