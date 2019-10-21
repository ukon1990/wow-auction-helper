export class RealmStatus {
  ahId: number;
  region: string;
  slug: string;
  name: string;
  battlegroup: string;
  locale: string;
  timezone: string;
  url: string;
  lastModified: any;
  size: number;
  lowestDelay: number;
  avgDelay: number;
  highestDelay: number;
  gameVersion = 0;

  // Only used for classic
  constructor(name: string, lastModified: number) {
    this.slug = name;
    this.name = name;
    this.lastModified = lastModified;
    this.gameVersion = 1;
  }
}
