import {ProfessionAPIResponse} from './model';
import {ProfessionRepository} from './repository';
import {Endpoints} from '../utils/endpoints.util';
import {AuthHandler} from '../handlers/auth.handler';
import {HttpClientUtil} from '../utils/http-client.util';
import {ItemLocale} from '@shared/models/item/item-locale';
import {NameSpace} from '../enums/name-space.enum';

export class ProfessionService {
  private http = new HttpClientUtil();

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

  getAllFromAPI(): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      await AuthHandler.getToken();
      const result = [];
      const {body} = await this.http.get(
        new Endpoints().getPath('profession/index', 'us', NameSpace.STATIC_RETAIL));

      for (const p of body.professions) {
        await this.http.get(
          new Endpoints().getPath('profession/' + p.id, 'us', NameSpace.STATIC_RETAIL))
          .then(async ({body: profession}) => {
            const res = {
              id: profession.id,
              name: profession.name as ItemLocale,
              description: profession.description,
              icon: await this.getIcon(profession.id, 'profession'),
              type: profession.type.type,
              skillTiers: [],
            };
            result.push(res);

            if (profession && profession.skill_tiers) {
              for (const skill of profession.skill_tiers) {
                await this.http.get(
                  new Endpoints().getPath(`profession/${profession.id}/skill-tier/${skill.id}`, 'us', NameSpace.STATIC_RETAIL))
                  .then(async ({body: s}) => {
                    const skillTier = {
                      id: s.id,
                      name: s.name,
                      min: s.minimum_skill_level,
                      max: s.maximum_skill_level,
                      recipes: []
                    };

                    s.categories.forEach(c =>
                      c.recipes.forEach(async r => {
                        skillTier.recipes.push(r.id);
                      }));
                    res.skillTiers.push(skillTier);
                  })
                  .catch(console.error);
              }
            }
          })
          .catch(console.error);
      }
      resolve(result);
    });
  }

  private getIcon(id: number, type = 'recipe'): Promise<string> {
    return new Promise(async (resolve, reject) => {
      await AuthHandler.getToken();
      const url = new Endpoints().getPath(`media/${type}/${id}`, 'us', NameSpace.STATIC_RETAIL);
      new HttpClientUtil().get(
        url
      )
        .then(({body}) => resolve(body.assets[0].value))
        .catch(reject);
    });
  }
}