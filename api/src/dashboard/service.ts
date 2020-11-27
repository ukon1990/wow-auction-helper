import {DashboardV2} from '../../../client/src/client/modules/dashboard/models/dashboard-v2.model';
import {DashboardRepository} from './repository';
import {AccessToken} from '../models/user/access-token.model';
import {v4} from 'uuid';

export class DashboardService {
  private repository: DashboardRepository;

  constructor(private user: AccessToken) {
    this.repository = new DashboardRepository();
  }

  getById(id: string): Promise<DashboardV2> {
    return this.repository.getById(id);
  }

  save(board: DashboardV2): Promise<any> {
    if (!board.id) {
      board.id = v4();
    }
    if (!board.createdBy) {
      board.createdBy = this.user.username;
    }
    if (!board.createdById) {
      board.createdById = this.user.sub;
    }

    board.isPublic = true;

    return new Promise<any>((resolve, reject) => {
      const token = this.user;
      this.getById(board.id)
        .then(storedVersion => {
          console.log('Stored version is', storedVersion);
          if (!storedVersion || storedVersion.createdById === this.user.sub) {
            this.repository.updateEntry(board.id, board)
              .then(() => {
                console.log(`${token ? token.username : 'Anonymous'} Successfully updated board (${board.id})`);
                resolve(board);
              })
              .catch(error => {
                console.error('Could not save board with id ', board.id, board, error);
                reject({code: 500, message: 'Could not save the board.'});
              });
          } else {
            console.log(`User with ID ${this.user.sub} tried to save ${board.id}, which is owned by ${storedVersion.createdById}`);
            reject({code: 401, message: 'You are not authorized to save this board'});
          }
        })
        .catch(reject);
    });
  }

  getCopyById(id, token: AccessToken = this.user): Promise<DashboardV2> {
    console.log(`${token ? token.username : 'Anonymous'} copied ${id}`);
    return new Promise<DashboardV2>(((resolve, reject) => {
      this.getById(id)
        .then(board => {
          resolve({
            ...board,
            id: v4(),
            parentId: id,
            createdById: token ? token.sub : null,
            createdBy: token ? token.username : null,
            isPublic: false,
            sortOrder: 0,
          });
        })
        .catch(reject);
    }));
  }

  delete(id: string): Promise<any> {
    const token = this.user;
    return new Promise<any>((resolve, reject) => {
      this.getById(id)
        .then(storedVersion => {
          if (storedVersion.createdById === this.user.sub) {
            this.repository.delete(id)
              .then(success => {
                console.log(`${token ? token.username : 'Anonymous'} Successfully deleted board (${id})`);
                console.log('Successfully deleted ', id);
                resolve({success: true});
              })
              .catch(reject);
          } else {
            console.log(`User with ID ${token.sub} tried to delete ${id}, which is owned by ${storedVersion.createdById}`);
            reject({code: 401, message: 'You are not authorized to delete this board'});
          }
        })
        .catch(reject);
    });
  }

  // Update a file in S3?

  getAll(): Promise<DashboardV2[]> {
    return this.repository.getAll();
  }
}
