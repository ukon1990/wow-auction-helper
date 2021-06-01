import { Realm } from '../../../../api/src/realm/model';
import {GameBuildVersion} from '../utils/game-build.util';

export class RealmStatus {
  id: number;
  ahId: number;
  region: string;
  slug: string;
  name: string;
  connectedTo: string[];
  realms: Realm[];
  battlegroup: string;
  locale: string;
  timezone: string;
  url: string | {[key: string]: string};
  tsmUrl: string;
  lastModified: any;
  size: number;
  lowestDelay: number;
  avgDelay: number;
  highestDelay: number;
  gameBuild?: GameBuildVersion;
  stats: {
    url: string;
    lastModified: number;
  };

  constructor(slug?: string, lastModified?: number) {
    if (slug) {
      this.slug = slug;
    }

    if (lastModified) {
      this.lastModified = lastModified;
    }
  }
}
