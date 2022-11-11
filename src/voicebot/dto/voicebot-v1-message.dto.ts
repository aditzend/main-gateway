export class VoicebotV1MessageDto {
  InteractionId: string;
  EventName: string;
  BotName: string;
  UserName?: string;
  Parameters?: string[];
  Message: string;
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
