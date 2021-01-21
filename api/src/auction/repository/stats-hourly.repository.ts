import { BaseRepository } from "../../repository/base.repository";
import { HourlyPriceHistoryEntryDBO } from "../models/price-history.model";

export class StatsHourlyRepository extends BaseRepository<HourlyPriceHistoryEntryDBO> {
  constructor() {
    super('wah_prices_hourly');
  }


  add(data: HourlyPriceHistoryEntryDBO): Promise<HourlyPriceHistoryEntryDBO> {
    return this.put(data);
  }
  getById(id: string): Promise<HourlyPriceHistoryEntryDBO> {
    return this.getOne(id);
  }

  getAllAfterTimestamp(timestamp: number): Promise<HourlyPriceHistoryEntryDBO[]> {
    throw new Error("Method not implemented.");
  }

  upsert(data: HourlyPriceHistoryEntryDBO): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const existing: HourlyPriceHistoryEntryDBO = await this.getByIdAtTime(data.id, data.timestamp);
      if (existing) {
        this.updateEntry(data.id, {
          ...existing,
          history: {
            ...existing.history,
            ...data.history,
          }
        },
          false,
          'NONE'
        )
          .then(() => resolve())
          .catch(reject);
      } else {
        this.add(data)
          .then(() => resolve())
          .catch(reject);
      }
    });
  }

  getByIdAtTime(id: string, timestamp: number): Promise<HourlyPriceHistoryEntryDBO> {
    return new Promise((resolve, reject) => {
      this.query({
        TableName: this.table,
        KeyConditionExpression: '#id = :id AND #timestamp = :timestamp',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#timestamp': 'timestamp'
        },
        ExpressionAttributeValues: {
          ':id': id,
          ':timestamp': timestamp,
        }
      })
        .then(entries =>
          resolve(entries[0]))
        .catch(reject);
    });
  }
}