import {TsmGameVersion} from '@functions/tsm/tsm.enum';

export interface TsmRegionSimplified {
  gameVersion: TsmGameVersion;
  regionId: number;
  region: string;
  lastModified: number;
}

export interface TsmRegion {
  regionId: number;
  name: string;
  gmtOffset: number;
  gameVersion: TsmGameVersion;
  lastModified: number;
}

export interface TsmRegions {
  metadata: { totalItems: number; };
  items: TsmRegion[];
}

export interface TsmRegionalItemStats {
  regionId: number;
  itemId: number;
  petSpeciesId: number;
  quantity: number;
  marketValue: number;
  avgSalePrice: number;
  salePct: number;
  soldPerDay: number;
  historical: number;
}