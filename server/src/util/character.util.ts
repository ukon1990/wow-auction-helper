import {Endpoints} from '../endpoints';
import {getLocale} from './locales';

const request: any = require('request');

export class CharacterUtil {

  public static get(req, res) {
    const url = new Endpoints().getPath(
      `character//${
        req.params.realm
        }/${
        req.params.name
        }?${
          this.getFields(req)
        }locale=${
        getLocale(req)
        }`,
      req.params.region);
      console.log('url', url);
    request.get(url,
      req.params.region,
      (error, response, body) => {
        if (error) {
          res.status(404);
          res.send({});
          console.error('could not get character', error);
          return;
        }
        res.send(JSON.parse(body));
      });
  }

  private static getFields(req) {
    const withFields = req.query.withFields;
    return withFields === 'true' ?
      'fields=professions,statistics,pets,petSlots,mounts&' : '';
  }
}
