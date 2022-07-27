import {MessageRepository} from './repository';

export class MessageService {
  private repository: MessageRepository;
  constructor() {
    this.repository = new MessageRepository();
  }
  getServiceMessage() {
    return this.repository.getAll();
  }
}