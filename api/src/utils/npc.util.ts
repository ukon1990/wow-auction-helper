import {HttpClientUtil} from './http-client.util';

export interface Coords {
  0: number[][];
}

export interface Map {
  zone: number;
  coords: Coords;
}

export interface NPC {
  name: string;
  tooltip: string;
  map: Map;
  completion_category: number;
}

export class NPCUtil {
  static getById(id: number) {
    return new Promise<NPC>((resolve, reject) => {
      new HttpClientUtil().get('https://www.wowhead.com/tooltip/npc/' + id)
        .then()
        .catch(reject);
    });
  }
}
