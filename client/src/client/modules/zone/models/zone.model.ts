export class Zone {
  id: number;
  name: string;
  patch?: string;
  typeId: number;
  parentId?: number;
  parent: Zone;
  territoryId: number;
  minLevel?: number;
  maxLevel?: number;
}
