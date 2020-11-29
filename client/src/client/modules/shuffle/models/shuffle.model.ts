export interface ShuffleItemLogEntry {
  outOf: number;
  count: number;
  user: {
    id?: string;
    name: string;
  };
}

export interface ShuffleItem {
  id: number;
  log: ShuffleItemLogEntry[];
  creates?: ShuffleItem[];
}

export interface Shuffle {
  id: string;
  title: string;
  description: string;
  items: ShuffleItem[];
  allowContributions: boolean;
  isPublic: boolean;
  createdById?: string;
  createdBy: string;
}
