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

@Injectable()
export class BotsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly filtersService: FiltersService,
  ) {}
  logger: Logger = new Logger('BotsService');

  url = process.env.BOT_API_URL || 'http://192.168.43.169:30048';
  wakeUpIntent = process.env.WAKE_UP_INTENT || '/start';

  async sendVoicebotMessage(voicebotMessage) {
    const endpoint = `${this.url}/v1/message`;
    const filters = voicebotMessage.Parameters?.filter(
      (param) => param.split('=')[0] === 'filter',
    ).map((param) => param.split('=')[1]);
    this.logger.verbose(`Filters: ${JSON.stringify(filters)}`);
    const botRequest: BotRequest = {
      sender: voicebotMessage.InteractionId,
      message: this.filtersService.cleanVoicebotMessage(
        filters,
        voicebotMessage.Message,
      ),
      channel: voicebotMessage.Channel,
      bot_name: voicebotMessage.BotName?.toLowerCase(),
      upload_outgoing_params: false,
      get_context: false,
      analyze: false,
      parameters: voicebotMessage.Parameters,
    };

    this.logger.verbose(`Sending message ${JSON.stringify(botRequest)}`);

    return this.httpService
      .post(endpoint, botRequest)
      .pipe(
        map((res) => res.data),
        map((data: BotResponse) => {
          const voicebotResponse: VoicebotV1ResponseDto = {
            InteractionId: data?.recipient_id,
            UserName: voicebotMessage.UserName,
            Parameters: voicebotMessage.Parameters,
            Message: voicebotMessage.Message,
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
