import { VoicebotV1EventDto } from './voicebot-v1-event.dto';
export class VoicebotV1ResponseDto {
  InteractionId: string;
  UserName: string;
  Parameters: string[];
  Message: string;
  Channel: string;
  Lang: string;
  Encoding: string;
  MimeType: string;
  Source: string;
  UserChannel: string;
  UserId: string;
  UserMail: string;
  BotName: string;
  Tarea: string;
  Events: VoicebotV1EventDto[];
}
