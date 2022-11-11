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
  context?: object;
  analyze: boolean;
  load_parameters: boolean;
}

export interface BotEvent {
  message: string;
  event_name: string;
}
