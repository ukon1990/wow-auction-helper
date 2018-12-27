export class Endpoints {
  private endpoints = {
    eu: 'https://eu.api.blizzard.com/',
    us: 'https://us.api.blizzard.com/',
    kr: 'https://kr.api.blizzard.com/',
    tw: 'https://tw.api.blizzard.com/',
    cn: 'https://gateway.battlenet.com.cn/'
  };

  getBase(region?: string): string {
    return region ? this.endpoints[region] : this.endpoints.eu;
  }

  getPath(query: string, region?: string): string {
    return this.getBase(region) + query;
  }
}


