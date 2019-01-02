import {Endpoints} from '../endpoints';
const request: any = require('request');

export class CharacterUtil {

  public static post(req, res) {
    const url = new Endpoints().getPath(
      `character/${
        encodeURIComponent(req.body.realm)
        }/${
        encodeURIComponent(req.body.name)
        }?${
        this.getFields(req)
        }locale=${
        req.body.locale
        }`,
      req.body.region);

    request.get(url,
      req.body.region,
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
    return req.body.withFields ?
      'fields=professions,statistics,pets,petSlots,mounts&' : '';
  }
}
