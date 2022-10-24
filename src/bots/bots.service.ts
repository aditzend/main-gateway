import { ForbiddenException, Injectable } from '@nestjs/common';
import { BotRequest, BotResponse } from './interfaces/bots.interfaces';
import { Logger } from '@nestjs/common';
import { ConcordiaMessage } from 'src/concordia/interfaces/concordia.interface';
import { HttpService } from '@nestjs/axios';
import { map, catchError, Observable } from 'rxjs';
import { AxiosResponse, AxiosRequestConfig } from 'axios';

@Injectable()
export class BotsService {
  constructor(private http: HttpService) {}
  logger: Logger = new Logger('BotsService');

  url = process.env.BOT_API_URL || 'http://192.168.43.169:30048';
  wakeUpIntent = process.env.WAKE_UP_INTENT || '/start';

  async sendConcordiaMessage(concordiaMessage: ConcordiaMessage) {
    const endpoint = `${this.url}/v1/message`;
    this.logger.debug(`Sending message to ${endpoint}`);
    const botRequest: BotRequest = {
      sender: concordiaMessage.InteractionId,
      message:
        concordiaMessage.EventName === '*online'
          ? this.wakeUpIntent
          : concordiaMessage.Message,
      channel: concordiaMessage.Channel,
      bot_name: concordiaMessage.BotName?.toLowerCase(),
      upload_outgoing_params: true,
      get_context: false,
      analyze: false,
    };

    return this.http
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

  async price() {
    return this.http
      .get('https://api.coindesk.com/v1/bpi/currentprice.json')
      .pipe(
        map((res) => res.data?.bpi),
        map((bpi) => bpi?.USD),
        map((usd) => {
          return usd?.rate;
        }),
      )
      .pipe(
        catchError(() => {
          throw new ForbiddenException('API not available');
        }),
      );
  }
}
