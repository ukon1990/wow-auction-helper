import {GameBuildVersion} from '../../../client/src/client/utils/game-build.util';

export interface Realm {
  id: number;
  slug: string;
  name: string;
  timezone: string;
  locale: string;
}

export interface AuctionHouseUpdateLog {
  id: number;
  lastModified: number;
  size: number;
  timeSincePreviousDump: number;
  url: string;
}

export interface AuctionHouse {
  id: number;
  realmSlugs: string;
  connectedId: number;
  region: string;
  gameBuild?: GameBuildVersion;
  url?: string | {[key: string]: string};
  realms: Realm[];
  tsm?: {
    url: string;
    lastModified: number;
  };
  /**
   * Deprecated
   */
  battlegroup?: string;
  lastRequested?: number;
  avgDelay?: number;
  highestDelay?: number;
  autoUpdate: boolean;
  firstRequested?: number;
  lowestDelay?: number;
  lastModified?: number;
  size?: number;
  lastHistoryDeleteEvent?: number;
  lastHistoryDeleteEventDaily?: number;
  lastTrendUpdateInitiation?: number;
  stats?: {
    url: string;
    lastModified: number;
  };
}

export interface DumpDelay {
  lowestDelay: number;
  highestDelay: number;
  avgDelay: number;
}


interface Self {
  href: string;
}

interface Links {
  self: Self;
}

interface Status {
  type: string;
  name: string;
}

interface Population {
  type: string;
  name: string;
}

interface Key {
  href: string;
}

interface Region {
  key: Key;
  name: string;
  id: number;
}

interface ConnectedRealm {
  href: string;
}

interface Type {
  type: string;
  name: string;
}

interface RealmAPI {
  id: number;
  region: Region;
  connected_realm: ConnectedRealm;
  name: string;
  category: string;
  locale: string;
  timezone: string;
  type: Type;
  is_tournament: boolean;
  slug: string;
}

interface Auctions {
  href: string;
}

export interface ConnectedRealmAPI {
  _links: Links;
  id: number;
  has_queue: boolean;
  status: Status;
  population: Population;
  realms: RealmAPI[];
  auctions: Auctions;
}
