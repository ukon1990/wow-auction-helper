import {GameBuildVersion} from "../../enum";
import {Realm} from "..";

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
  lastModified: number;
  lastRequested: number;
  nextUpdate: number;
  size: number;
  lowestDelay: number;
  avgDelay: number;
  highestDelay: number;
  gameBuild?: GameBuildVersion;
  stats: {
    url: string;
    lastModified: number;
  };
  ahTypeIsChanged?: boolean;

  constructor(slug?: string, lastModified?: number) {
    if (slug) {
      this.slug = slug;
    }

    if (lastModified) {
      this.lastModified = lastModified;
    }
  }
}