export interface BotRequest {
  sender: string;
  message: string;
  channel: string;
  bot_name: string;
  upload_outgoing_params: boolean;
  get_context: boolean;
  analyze: boolean;
  parameters: string[];
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
