import {DashboardV2} from '../../../client/src/client/modules/dashboard/models/dashboard-v2.model';
import {DashboardRepository} from './repository';
import {AccessToken} from '../models/user/access-token.model';
import generateUUID from '../../../client/src/client/utils/uuid.util';

export class DashboardService {
  private repository: DashboardRepository;

  constructor(private user: AccessToken) {
    this.repository = new DashboardRepository();
  }

  save(board: DashboardV2): Promise<any> {
    if (!board.id) {
      board.id = generateUUID();
    }
    if (!board.createdBy) {
      board.createdBy = this.user.username;
    }
    if (!board.createdById) {
      board.createdById = this.user.sub;
    }

    board.isPublic = true;
    // TODO: Verifiser om det er slik jeg vil gjøre det, med tanke på eierskap til board osv

    return new Promise<any>((resolve, reject) => {
      this.repository.getById(board.id)
        .then(storedVersion => {
          console.log('Stored version is', storedVersion);
          if (!storedVersion || storedVersion.createdById === this.user.sub) {
            this.repository.updateEntry(board.id, board)
              .then(() => {
                console.log('Successfully updated board');
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

  delete(id: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
    this.repository.getById(id)
      .then(storedVersion => {
        if (storedVersion.createdById === this.user.sub) {
          this.repository.delete(id)
            .then(success => {
              console.log('Successfully deleted ', id);
              resolve({success: true});
            })
            .catch(reject);
        } else {
          console.log(`User with ID ${this.user.sub} tried to delete ${id}, which is owned by ${storedVersion.createdById}`);
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
