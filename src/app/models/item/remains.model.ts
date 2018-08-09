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

  addSource(item: Item): void {
    this.sources.push(new RemainsSource(item, 1, 2));
  }

  updateSourcesDropChance(): void {
    this.sources.forEach(source =>
      source.setDropChance());
  }
}

export class RemainsSource {
  id: number;
  name: string;
  count: number;
  outOf: number;
  cost: number;
  roi: number;
  value?: number;
  dropChance: number;

  constructor(item: Item, count: number, outOf: number) {
    this.id = item.id;
    this.name = item.name;
    this.count = count;
    this.outOf = outOf;

    this.setDropChance();
  }

  update(count: number, outOf: number): void {
    this.count += count;
    this.outOf += outOf;
    this.setDropChance();
  }

  setDropChance(): void {
    this.dropChance = this.count / this.outOf;
  }

  calculate(): void {
  }
}
