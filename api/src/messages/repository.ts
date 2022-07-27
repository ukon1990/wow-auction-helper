import {BaseRepository} from '../repository/base.repository';
import {MessageModel} from '../../../shared/src/models';

export class MessageRepository extends BaseRepository<MessageModel> {
  constructor() {
    super('wah_messages');
  }

  add(data: MessageModel): Promise<MessageModel> {
    return Promise.resolve(undefined);
  }

  getAllAfterTimestamp(timestamp: number): Promise<MessageModel[]> {
    return this.getAllAfter(timestamp);
  }

  getById(id: string): Promise<MessageModel> {
    return this.getOne(id);
  }
}