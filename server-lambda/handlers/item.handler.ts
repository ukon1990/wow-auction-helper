import {AuthHandler} from './auth.handler';
import {Callback} from 'aws-lambda';

export class ItemHandler {
  async getById(id: number, callback: Callback) {
    await AuthHandler.getToken();
  }
}
