import { Item } from './item';
import { WoWHeadProspectedFrom } from './wowhead';

export class Remains {
  id: number;
  name: string;
  buyout?: number;
  yield?: number;
  sources: RemainsSource[] = [];

  constructor(item: Item) {
    this.id = item.id;
    this.name = item.name;
  }
}

export class RemainsSource {
  id: number;
  name: string;
  cost: number;
  roi: number;
  value?: number;
  dropChance: number;

  constructor(mill?: WoWHeadProspectedFrom) {
    if (mill) {
      this.id = mill.id;
      this.name = mill.name;
      this.dropChance = mill.dropChance;
    }
  }
}
