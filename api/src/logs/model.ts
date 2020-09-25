export interface SQLProcess {
  id: number;
  queryId: number;
  tid: number;
  command: string;
  state: string;
  time: number;
  timeMs: number;
  info: string;
  stage: number;
  maxStage: number;
  progress: number;
  memoryUsed: number;
  examinedRows: number;
}

export interface TableSize {
  name: string;
  sizeInMb: number;
  rows: number;
}
