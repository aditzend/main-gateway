import { Test, TestingModule } from '@nestjs/testing';
import { VoicebotController } from './voicebot.controller';

describe('VoicebotController', () => {
  let controller: VoicebotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoicebotController],
    }).compile();

    controller = module.get<VoicebotController>(VoicebotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
