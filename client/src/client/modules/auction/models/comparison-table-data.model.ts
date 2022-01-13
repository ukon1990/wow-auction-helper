import {Modifiers} from './auction.model';

export interface ComparisonTableDataModel {
  id: string;
  itemID: number;
  name: string;
  itemLevel: number;
  bonusIds: number[];
  modifiers: Modifiers[];
  petSpeciesId?: number;
  petLevel?: number;
  petQualityId?: number;
  quantityTotal: number;
  otherQuantityTotal: number;
  buyout: number;
  otherBuyout: number;
  buyoutDifference: number;
  buyoutDifferencePercent: number;
}