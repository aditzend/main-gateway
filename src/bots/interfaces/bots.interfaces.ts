import { Parameter } from './parameter.interface';
import { Slot } from './slot.interface';

export interface BotRequest {
  sender: string;
  message: string;
  bot_name: string;
  channel?: string;
  upload_outgoing_params?: boolean;
  get_context?: boolean;
  analyze?: boolean;
  parameters?: Parameter[];
  load_slots?: Slot[];
}

export interface BotResponse {
  recipient_id: string;
  bot_name: string;
  channel: string;
  events: BotEvent[];
  context?: Context;
  analyze: boolean;
  load_parameters: boolean;
}

interface Context {
  slots: object;
  intent: object;
  entities: object;
  rasa_message_id: string;
  action_name: string;
}

export interface BotEvent {
  message: string;
  event_name: string;
}
