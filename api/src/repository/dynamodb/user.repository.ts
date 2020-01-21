import {BaseRepository} from './base.repository';
import {AppUser} from '../../models/user/app-user.model';
import {AWSError} from 'aws-sdk';
import {environment} from '../../../../client/src/environments/environment';

export class UserRepository extends BaseRepository<AppUser> {

  constructor() {
    super('wah-user');
  }

  add(data: AppUser): Promise<AWSError | AppUser> {
    if (environment.test) {
      return;
    }
    return undefined;
  }

  getById(id: number): Promise<AWSError | AppUser> {
    if (environment.test) {
      return;
    }
    return new Promise<AWSError | AppUser>(async (resolve, reject) => {
      this.getOne(id)
        .then((user) => {
          if (user) {
            resolve(user);
          }
          // Create new user?
          resolve(null);
        })
        .catch(reject);
    });
  }

  update(data: AppUser): Promise<AWSError | AppUser> {
    if (environment.test) {
      return;
    }
    data.lastModified = +new Date();
    return this.put(data);
  }
}
