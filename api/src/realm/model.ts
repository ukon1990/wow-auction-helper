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
  url: string;
  realms: Realm[];
  tsm: {
    url: string;
    lastModified: number;
  };
  battlegroup: string;
  lastRequested: number;
  avgDelay: number;
  highestDelay: number;
  autoUpdate: boolean;
  firstRequested: number;
  lowestDelay: number;
  lastModified: number;
  size: number;
  lastHistoryDeleteEvent: number;
  stats: {
    url: string;
    lastModified: number;
  };
}

export interface DumpDelay {
  lowestDelay: number;
  highestDelay: number;
  avgDelay: number;
}
