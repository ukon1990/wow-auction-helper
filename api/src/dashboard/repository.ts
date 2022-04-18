import {BaseRepository} from '../repository/base.repository';
import {Dashboard} from '@shared/models';

export class DashboardRepository extends BaseRepository<Dashboard> {
  constructor() {
    super('wah_dashboards');
  }

  add(data: Dashboard): Promise<Dashboard> {
    return Promise.resolve(undefined);
  }

  getAllAfterTimestamp(timestamp: number): Promise<Dashboard[]> {
    return Promise.resolve([]);
  }

  getById(id: string | number): Promise<Dashboard> {
    return this.getOne(id);
  }

  getAll(): Promise<Dashboard[]> {
    return this.scan({
      TableName: this.table,
      ProjectionExpression: 'id, title, description, tags, createdBy, lastModified',
    });
  }
}