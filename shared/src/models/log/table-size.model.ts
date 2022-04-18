export interface TableSize {
  name: string;
  tableSizeInMb: number;
  indexSizeInMb: number;
  sizeInMb: number;
  freeTableSizeInMb: number;
  allocatedTableSize: number;
  rows: number;
}