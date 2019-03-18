import {AuthHandler} from './auth.handler';

export class ItemHandler {
  async getById(id: number) {
    await AuthHandler.getToken();
  }
}
