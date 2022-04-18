import {MediaGameData} from '../shared/models';
import {HttpClientUtil} from './http-client.util';
import {BLIZZARD} from '../secrets';

export class GameMediaUtil {
  static async getAllMedia({key}: MediaGameData, region: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      new HttpClientUtil().get(`${key.href}&access_token=${BLIZZARD.ACCESS_TOKEN}`)
        .then(({body}) => {
          if (body && body.assets) {
            resolve(body.assets);
            return;
          }
          reject('No media found');
        })
        .catch(() => reject('No media found'));
    });
  }

  static async getIcon({key}: MediaGameData, region: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      new HttpClientUtil().get(`${key.href}&access_token=${BLIZZARD.ACCESS_TOKEN}`)
        .then(({body}) => {
          if (body && body.assets && body.assets[0].key === 'icon') {
            const icon = body.assets[0].value;
            resolve(this.getRawIconFileName(icon, region));
            return;
          }
          reject('No media found');
        })
        .catch(() => reject('No media found'));
    });
  }

  static getRawIconFileName(icon: string, region: string): string {
    return icon
      .replace(`https://render-${region}.worldofwarcraft.com/icons/56/`, '')
      .replace(`https://render.worldofwarcraft.com/classic-${region}/icons/56/`, '')
      .replace(`https://render.worldofwarcraft.com/${region}/icons/56/`, '')
      .replace('.jpg', '');
  }
}