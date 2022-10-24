import { UseInterceptors } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'ws';
import { Server } from 'http';
import { LoggingInterceptor } from '../logging.interceptor';
import { Logger } from '@nestjs/common';
import { ConcordiaMessage } from './interfaces/concordia.interface';
import { BotResponse, BotRequest } from '../bots/interfaces/bots.interfaces';
import { BotsService } from '../bots/bots.service';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@WebSocketGateway(8991)
export class ConcordiaGateway {
  constructor(private botsService: BotsService) {}
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ConcordiaGateway');

  listenLegacy() {
    this.server.on('connection', (ws: Socket) => {
      this.logger.log(`Client connected`);
      ws.on('message', async (e) => {
        const payload: ConcordiaMessage = JSON.parse(e);
        this.botsService.sendConcordiaMessage(payload).then((res) => {
          res.forEach((r) => {
            r.forEach((event) => ws.send(JSON.stringify(event)));
          });
        });
      });
    });
  }

  emit(message) {
    this.server.emit(message);
  }

  @SubscribeMessage('concordiaMessage')
  handleMessage(client: Socket, payload: any) {
    const response = this.botsService
      .sendConcordiaMessage(payload)
      .then((res) => {
        res.forEach((r) => {
          r.forEach((event) => client.send(JSON.stringify(event)));
        });
      });
    this.logger.log(response);
    // return this.botsService.sendConcordiaMessage(payload);
  }

  afterInit() {
    this.logger.log('Concordia Websocket Server initialized');
    this.listenLegacy();
  }

  handleDisconnect(@ConnectedSocket() client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
