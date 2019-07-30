export interface Realm {
  type: string;
  population: string;
  queue: boolean;
  status: boolean;
  name: string;
  slug: string;
  battlegroup: string;
  locale: string;
  timezone: string;
  connected_realms: string[];
}

export interface RealmStatuses {
  realms: Realm[];
}
