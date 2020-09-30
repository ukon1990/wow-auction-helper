export class RealmStatus {
  id: number;
  ahId: number;
  region: string;
  slug: string;
  name: string;
  connectedTo: string[];
  battlegroup: string;
  locale: string;
  timezone: string;
  url: string;
  tsmUrl: string;
  lastModified: any;
  size: number;
  lowestDelay: number;
  avgDelay: number;
  highestDelay: number;

  constructor(slug?: string, lastModified?: number) {
    if (slug) {
      this.slug = slug;
    }

    if (lastModified) {
      this.lastModified = lastModified;
    }
  }
}
