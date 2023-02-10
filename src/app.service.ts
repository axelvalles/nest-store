import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Client } from 'pg';
import config from './config';

@Injectable()
export class AppService {
  constructor(
    @Inject('PG') private pgClient: Client,
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
  ) { }
  getHello(): string {
    const { database, host } = this.configService.postgres

    return `Hello World! ${host} ${database}`;
  }

  async findTasks() {
    const response = await this.pgClient.query('SELECT * FROM tasks')

    return response.rows

  }
}
