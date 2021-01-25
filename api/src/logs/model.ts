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
  tableSizeInMb: number;
  indexSizeInMb: number;
  sizeInMb: number;
  rows: number;
}

export interface GlobalStatus {
  Max_used_connections: number;
  Threads_connected: number;
  Uptime: number;
  timestamp: Date;
}
