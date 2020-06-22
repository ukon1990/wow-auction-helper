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
import {ProfessionService} from '../profession/service';

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
        await Promise.all([
          this.getAndSetNpc(),
          this.getAndSetZones(),
          this.getAndSetRecipes(),
          this.getAndSetItems(),
          this.getAndSetPets(),
          this.getAndSetProfessions()
        ])
          .catch((error) => {
            reject(error);
          });
        await this.getAndSetTimestamps()
          .catch(console.error);

        console.log('DONE!');
        resolve();
      } else {
        reject({
          status: 401,
          message: 'You do not have permission to perform this task'
        });
      }
    });
  }

  static getAndSetTimestamps(db: DatabaseUtil = new DatabaseUtil(false)): Promise<any> {
    return new Promise(async (resolve, reject) => {
      db.query(UpdatesRepository.getLatestTimestamps())
        .then(async (rows: Timestamps[]) => {
          const timestamps = rows[0];

          await new S3Handler().save(
            timestamps,
            `timestamps.json.gz`,
            {
              region: ''
            })
            .then(r => {
              console.log('Successfully uploaded timestamps');
              db.end();
              resolve(rows);
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  static getAndSetRecipes(db: DatabaseUtil = new DatabaseUtil(false)): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of this.locales) {
        await RecipeService.getAllAfter(0, this.getDbLocale(locale), db)
          .then(async recipes => {
            await new S3Handler().save(
              recipes,
              `recipe/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded recipes');
              })
              .catch(reject);
          })
          .catch(reject);
      }

      db.end();
      resolve(true);
    });
  }

  private static getDbLocale(locale: string) {
    return locale === 'pt_PT' ? 'pt_BR' : locale;
  }

  static getAndSetItems(db: DatabaseUtil = new DatabaseUtil(false)): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of this.locales) {
        await new ItemHandler().getAllRelevant(new Date(0), locale, db)
          .then(async items => {
            await new S3Handler().save(
              items,
              `item/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded items');
              })
              .catch(console.error);
          })
          .catch(reject);
      }

      db.end();
      resolve(true);
    });
  }

  static getAndSetPets(db: DatabaseUtil = new DatabaseUtil(false)): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of this.locales) {
        await new PetHandler().getAllRelevant(new Date(0).toJSON(), locale, db)
          .then(async pets => {
            await new S3Handler().save(
              pets,
              `pet/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded pets');
              })
              .catch(console.error);
          })
          .catch(reject);
      }

      db.end();
      resolve(true);
    });
  }

  static getAndSetNpc(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of this.locales) {
        await NpcHandler.getAll(locale, new Date(0).toJSON())
          .then(async npcs => {
            await new S3Handler().save(
              npcs,
              `npc/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded NPCs');
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
          .then(async zones => {
            await new S3Handler().save(
              zones,
              `zone/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded zones');
              })
              .catch(console.error);
          })
          .catch(reject);
      }

      resolve(true);
    });
  }

  static getAndSetProfessions(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      for (const locale of this.locales) {
        await ProfessionService.getAll(this.getDbLocale(locale))
          .then(async professions => {
            await new S3Handler().save(
              professions,
              `profession/${locale}.json.gz`,
              {
                region: ''
              })
              .then(() => {
                console.log('Successfully uploaded professions');
              })
              .catch(console.error);
          })
          .catch(reject);
      }

      resolve(true);
    });
  }
}
