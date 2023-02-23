import { ForbiddenException, Injectable } from '@nestjs/common';
import { BotRequest, BotResponse } from './interfaces/bots.interfaces';
import { Logger } from '@nestjs/common';
import { ConcordiaMessage } from 'src/concordia/interfaces/concordia.interface';
import { HttpService } from '@nestjs/axios';
import { map, catchError, Observable } from 'rxjs';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { VoicebotV1MessageDto } from 'src/voicebot/dto/voicebot-v1-message.dto';
import { VoicebotV1ResponseDto } from 'src/voicebot/dto/voicebot-v1-response.dto';
import { FiltersService } from 'src/filters/filters.service';
import { Parameter } from './interfaces/parameter.interface';
import { Slot } from './interfaces/slot.interface';

@Injectable()
export class BotsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly filtersService: FiltersService,
  ) {}
  logger: Logger = new Logger('BotsService');

  url = process.env.BOT_API_URL || 'http://192.168.43.169:30048';
  wakeUpIntent = process.env.WAKE_UP_INTENT || '/start';

  async sendVoicebotMessage(voicebotMessage: VoicebotV1MessageDto) {
    const endpoint = `${this.url}/v1/message`;
    let messageForRasa = '';
    const filters: string[] = [];
    const transformedParameters: Parameter[] = [];
    const slots: Slot[] = [];

    // If voicebotMessage has Parameters, we need to split them by '=' and turn them into Parameters
    voicebotMessage.Parameters?.forEach((param) => {
      const [parameter_name, parameter_value] = param.split('=');
      if (parameter_name === 'filters') filters.push(parameter_value);
      else
        transformedParameters.push({
          parameter_name,
          parameter_value,
        });
    });

    // Tarea should be converted into a Slot
    if (voicebotMessage.Tarea) {
      slots.push({
        slot_name: 'Tarea',
        slot_value: voicebotMessage.Tarea,
      });
    }

    if (voicebotMessage.EventName === '*online') {
      messageForRasa = this.wakeUpIntent;
    } else if (voicebotMessage.EventName === '*noresponse') {
      messageForRasa = '*noresponse';
      // Don't load slots
      slots.length = 0;
    } else {
      // EventName is *text and requires a full Message field
      messageForRasa = this.filtersService.cleanVoicebotMessage(
        filters,
        voicebotMessage.Message,
      );
      // Don't load slots
      slots.length = 0;
    }

    const botRequest: BotRequest = {
      sender: voicebotMessage.InteractionId,
      message: messageForRasa,
      channel: voicebotMessage.Channel,
      bot_name: voicebotMessage.BotName?.toLowerCase(),
      upload_outgoing_params: true,
      get_context: true,
      analyze: true,
      parameters: transformedParameters,
      load_slots: slots,
    };

    this.logger.verbose(`Sending message ${JSON.stringify(botRequest)}`);

    return this.httpService
      .post(endpoint, botRequest)
      .pipe(
        map((res) => res.data),
        map((data: BotResponse) => {
          const { slots } = data.context;
          const voicebotResponse: VoicebotV1ResponseDto = {
            InteractionId: data?.recipient_id,
            UserName: voicebotMessage.UserName,
            Parameters: slots,
            Message:
              voicebotMessage.Message === ''
                ? 'online'
                : voicebotMessage.Message,
            EventName: voicebotMessage.EventName,
            Lang: voicebotMessage.Lang,
            Encoding: voicebotMessage.Encoding,
            MimeType: voicebotMessage.MimeType,
            Source: voicebotMessage.Source,
            UserChannel: voicebotMessage.UserChannel,
            UserId: voicebotMessage.UserId,
            UserMail: voicebotMessage.UserMail,
            BotName: voicebotMessage.BotName,
            Channel: voicebotMessage.Channel,
            Tarea: voicebotMessage.Tarea,
            Events: data.events.map((event) => {
              return {
                name: event.event_name,
                message: event.message,
              };
            }),
          };
          return voicebotResponse;
        }),
      )
      .pipe(
        catchError(() => {
          throw new ForbiddenException('BOT API not available');
        }),
      );
  }

  async sendConcordiaMessage(concordiaMessage) {
    const endpoint = `${this.url}/v1/message`;
    this.logger.debug(`Sending message to ${endpoint}`);
    const botRequest: BotRequest = {
      sender: concordiaMessage.InteractionId,
      message:
        concordiaMessage.EventName === '*online'
          ? this.wakeUpIntent
          : this.filtersService.cleanConcordiaMessage(concordiaMessage.Message),
      channel: concordiaMessage.Channel,
      bot_name: concordiaMessage.BotName?.toLowerCase(),
      upload_outgoing_params: true,
      get_context: false,
      analyze: false,
      parameters: concordiaMessage.Parameters,
    };

    return this.httpService
      .post(endpoint, botRequest)
      .pipe(
        map((res) => {
          return res.data.events.map((event) => {
            return {
              InteractionId: res.data.recipient_id,
              UserName: concordiaMessage.UserName,
              Parameters: concordiaMessage.Parameters,
              Lang: concordiaMessage.Lang,
              Encoding: concordiaMessage.Encoding,
              MimeType: concordiaMessage.MimeType,
              Source: concordiaMessage.Source,
              UserChannel: concordiaMessage.UserChannel,
              UserId: concordiaMessage.UserId,
              UserMail: concordiaMessage.UserMail,
              BotName: res.data.bot_name,
              Channel: res.data.channel,
              Message: event.message,
              EventName: event.event_name,
            };
          });
        }),
      )
      .pipe(
        catchError(() => {
          throw new ForbiddenException('BOT API error');
        }),
      );
  }

  async version() {
    return this.httpService.get(`${this.url}/version`).pipe(
      map((res) => res.data),
      catchError(() => {
        throw new ForbiddenException('BOT API not available');
      }),
    );
  }
}
