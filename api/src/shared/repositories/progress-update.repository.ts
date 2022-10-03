import {BaseRepository} from '../../repository/base.repository';
import {UpdateProgressModel} from '@models/update';


interface AppConfig {
  expansions: string[];
  classic: {
    phase: number;
    expansion: number;
  };
  retail: {
    expansion: number;
  };
  admin: {
    progress: {
      [key: string]: UpdateProgressModel
    }
  };
  status: {
    severity: number;
    title: string;
    description: string;
    timestamp: number;
  }[];
}

export class ProgressUpdateRepository extends BaseRepository<UpdateProgressModel> {
  constructor() {
    super('wah_app_settings');
  }

  adda(data: UpdateProgressModel): Promise<UpdateProgressModel> {
    throw new Error('Method not implemented.');
  }

  getAllAfterTimestamp(timestamp: number): Promise<UpdateProgressModel[]> {
    return Promise.resolve([]);
  }

  getById(id: string | number): Promise<UpdateProgressModel> {
    return Promise.resolve(undefined);
  }
}