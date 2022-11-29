import { VoicebotV1EventDto } from './voicebot-v1-event.dto';
export class VoicebotV1ResponseDto {
  InteractionId: string;
  BotName: string;
  EventName: string;
  Parameters?: object;
  Message?: string;
  UserName?: string;
  Channel?: string;
  Lang?: string;
  Encoding?: string;
  MimeType?: string;
  Source?: string;
  UserChannel?: string;
  UserId?: string;
  UserMail?: string;
  Tarea?: string;
  Events: VoicebotV1EventDto[];
}
