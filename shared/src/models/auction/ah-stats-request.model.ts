export interface AhStatsRequest {
  ahId?: number;
  itemId: number;
  petSpeciesId: number;
  bonusIds: number[];
  ahTypeId?: number;
  date?: Date;
}
