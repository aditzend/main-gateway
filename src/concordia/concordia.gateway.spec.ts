import { Test, TestingModule } from '@nestjs/testing';
import { ConcordiaGateway } from './concordia.gateway';

describe('ConcordiaGateway', () => {
  let gateway: ConcordiaGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConcordiaGateway],
    }).compile();

    gateway = module.get<ConcordiaGateway>(ConcordiaGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
