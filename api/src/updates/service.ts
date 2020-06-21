import {DatabaseUtil} from '../utils/database.util';
import {UpdatesRepository} from './repository';
import {Timestamps} from './model';
import {S3Handler} from '../handlers/s3.handler';

export class UpdatesService {
  static getAndSetTimestamps(db: DatabaseUtil): Promise<any> {
    // https://wah-data.s3-eu-west-1.amazonaws.com/timestamps.json.gz
    return new Promise(async (resolve, reject) => {
      db.query(UpdatesRepository.getLatestTimestamps())
        .then((rows: Timestamps[]) => {
          const timestamps = rows[0];

          new S3Handler().save(
            timestamps,
            `timestamps.json.gz`,
            {
              region: ''
            })
            .then(r => {
              console.log('Successfully uploaded timestamps');
              resolve(rows);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
}
