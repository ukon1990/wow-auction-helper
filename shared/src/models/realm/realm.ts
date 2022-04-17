export class Realm {
  id: number;
  type?: string;
  population?: string;
  queue?: boolean;
  status?: boolean;
  name: string;
  slug: string;
  battlegroup?: string;
  locale: string; // de_DE, en_GB
  timezone: string; // Europe/Paris
  connected_realms?: Array<string> = new Array<string>();
}