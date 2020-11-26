import {BaseRepository} from '../repository/base.repository';
import {DashboardV2} from '../../../client/src/client/modules/dashboard/models/dashboard-v2.model';

export class DashboardRepository extends BaseRepository<DashboardV2> {
  constructor() {
    super('wah_dashboards');
  }

  add(data: DashboardV2): Promise<DashboardV2> {
    return Promise.resolve(undefined);
  }

  getAllAfterTimestamp(timestamp: number): Promise<DashboardV2[]> {
    return Promise.resolve([]);
  }

  getById(id: string | number): Promise<DashboardV2> {
    return Promise.resolve(undefined);
  }
}
