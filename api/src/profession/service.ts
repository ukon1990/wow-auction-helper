import {ProfessionAPIResponse} from './model';
import {ProfessionRepository} from './repository';

export class ProfessionService {

  static getAll(locale: string): Promise<ProfessionAPIResponse> {
    return new Promise((resolve, reject) => {
      new ProfessionRepository().getAllAfter(0, locale)
        .then(professions => {
          resolve({
            professions,
            timestamp: professions[0].timestamp
          });
        })
        .catch(reject);
    });
  }

  getAllFromAPI(): Promise<ProfessionAPIResponse> {
    return new Promise<ProfessionAPIResponse>((resolve, reject) => {
      resolve();
    });
  }
}
