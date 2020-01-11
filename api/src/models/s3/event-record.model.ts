export class EventRecord {
  s3: EventSchema;
}

export class EventSchema {
  s3SchemaVersion: string;
  configurationId: string;
  bucket: EventBucket;
  object: EventObject;
}

export class EventBucket {
  name: string; // 'wah-data-eu',
}

export class EventObject {
  key: string; // 'auctions/eu/122/1578763810000.json.gz',
  size: number; // 1846845,
}


