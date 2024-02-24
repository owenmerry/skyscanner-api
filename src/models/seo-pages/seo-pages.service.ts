import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import type {
  IndicitiveQuote,
  SkyscannerAPIIndicitiveResponse,
} from '../../helpers/sdk/indicitive';
import { skyscanner } from '../../helpers/sdk/flight';
import { SearchSDK } from '../../helpers/sdk/flight';
import { getPrice } from '../../helpers/sdk/price';

@Injectable()
export class SeoPagesService {
  constructor() {}
}
