import {DatabaseUtil} from '../utils/database.util';
import {UpdatesRepository} from './repository';
import {Timestamps} from './model';
import {S3Handler} from '../handlers/s3.handler';
import {RecipeService} from '../recipe/service';
import {LocaleUtil} from '../utils/locale.util';
import {ItemHandler} from '../handlers/item.handler';
import {NpcHandler} from '../handlers/npc.handler';
import {ZoneHandler} from '../handlers/zone.handler';
import {PetHandler} from '../handlers/pet.handler';

export class UpdatesService {
  static readonly locales = UpdatesService.getLocales();

  private static getLocales(): string[] {
    let list = [];
    Object.keys(LocaleUtil.locales).forEach((region) => {
      list = [...list, ...LocaleUtil.locales[region]];
    });
    return list;
  }

  static init(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (process.env.IS_OFFLINE || process.env.IS_LOCAL) {
        const db = new DatabaseUtil(false);
        await Promise.all([
          // this.getAndSetNpc(),
          this.getAndSetZones(),
          // this.getAndSetRecipes(db),
          this.getAndSetItems(db),
          // this.getAndSetPets(db),
          this.getAndSetTimestamps(db)
        ])
          .catch((error) => {
            db.end();
            reject(error);
          });

        db.end();
        resolve();
      } else {
        reject({
          status: 401,
          message: 'You do not have permission to perform this task'
        });
      }
    });
  }

  static getAndSetTimestamps(db: DatabaseUtil): Promise<any> {
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

  static getAndSetRecipes(db: DatabaseUtil): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of this.locales) {
        await RecipeService.getAllAfter(0, locale, db)
          .then(recipes => {
            new S3Handler().save(
              recipes,
              `test/recipe/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded timestamps');
              })
              .catch(reject);
          })
          .catch(reject);
      }

      resolve(true);
    });
  }

  static getAndSetItems(db: DatabaseUtil): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of this.locales) {
        await new ItemHandler().getAllRelevant(new Date(0), locale, db)
          .then(recipes => {
            new S3Handler().save(
              recipes,
              `test/item/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded timestamps');
              })
              .catch(console.error);
          })
          .catch(reject);
      }

      resolve(true);
    });
  }

  static getAndSetPets(db: DatabaseUtil): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of this.locales) {
        await new PetHandler().getAllRelevant(new Date(0).toJSON(), locale, db)
          .then(recipes => {
            new S3Handler().save(
              recipes,
              `test/item/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded timestamps');
              })
              .catch(console.error);
          })
          .catch(reject);
      }

      resolve(true);
    });
  }

  static getAndSetNpc(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of this.locales) {
        await NpcHandler.getAll(locale, new Date(0).toJSON())
          .then(recipes => {
            new S3Handler().save(
              recipes,
              `test/npc/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded timestamps');
              })
              .catch(console.error);
          })
          .catch(reject);
      }

      resolve(true);
    });
  }

  static getAndSetZones(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of this.locales) {
        await ZoneHandler.getAll(locale, new Date(0).toJSON())
          .then(recipes => {
            new S3Handler().save(
              recipes,
              `test/zone/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded timestamps');
              })
              .catch(console.error);
          })
          .catch(reject);
      }

      resolve(true);
    });
  }
}
