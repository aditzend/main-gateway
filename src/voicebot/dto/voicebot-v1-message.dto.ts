import { IsNotEmpty } from 'class-validator';

export class VoicebotV1MessageDto {
  InteractionId: string;
  Message: string;
  EventName: string;
  BotName: string;
  UserName?: string;
  Parameters?: string[];
  Channel?: string;
  Lang?: string;
  Encoding?: string;
  MimeType?: string;
  Source?: string;
  UserChannel?: string;
  UserId?: string;
  UserMail?: string;
  Tarea?: string;
}
