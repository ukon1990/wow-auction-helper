import { DashboardV2 } from '../../../client/src/client/modules/dashboard/models/dashboard-v2.model';

export class DashboardService {
  save(userId: string, board: DashboardV2): Promise<any> {
    return new Promise<any>((resolve, reject) => {});
  }


  delete(userId: string, boardId: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {});
  }

  getAll(userId: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve({userId});
    });
  }
}
