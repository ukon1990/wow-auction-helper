import { Item } from './item.model';
export class RemainsSource {
  id: number;
  name: string;
  count: number;
  cost: number;
  value?: number;
  dropChance: number;

  constructor(item: Item, count: number, outOf: number) {
    this.id = item.id;
    this.name = item.name;
    this.count = count;
  }

  public static update(count: number, remains: Remains, source: RemainsSource): void {
    source.count += count;
    RemainsSource.setDropChance(remains, source);
  }

  public static setDropChance(remains: Remains, source: RemainsSource): void {
    source.dropChance = source.count / remains.outOf;
  }
}

export interface RemainsSourceTarget {
  target: RemainsSource;
  origin: Remains;
}

export class  Remains {
  id: number;
  name: string;
  outOf: number;
  buyout?: number;
  yield?: number;
  sources: RemainsSource[] = [];
  saleRate?: number;

  constructor(item: Item) {
    this.id = item.id;
    this.name = item.name;
  }

  public static updateSourcesDropChance(remains: Remains): void {
    remains.sources.forEach(source =>
      RemainsSource.setDropChance(remains, source));
  }

  public static addSource(item: Item, remains: Remains): void {
    remains.sources.push(new RemainsSource(item, 1, 2));
  }
}