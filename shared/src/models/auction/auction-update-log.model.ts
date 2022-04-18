import {AuctionHouseUpdateLog} from "../../models";

export class AuctionUpdateLog {
  public minTime = 0;
  public avgTime = 0;
  public maxTime = 0;
  public lastModified: number;
  public entries: AuctionHouseUpdateLog[];

  constructor(private list: AuctionHouseUpdateLog[]) {
    this.calculateDiff(list);
    this.lastModified = this.entries[0].lastModified;
  }

  private calculateDiff(list: AuctionHouseUpdateLog[]) {
    let avgBase = 0;
    this.entries = [];
    list.sort((a, b) => b.lastModified - a.lastModified)
      .forEach((entry, index) => {
        const nextEntry: AuctionHouseUpdateLog = list[index + 1];

        if (nextEntry) {
          const result: AuctionHouseUpdateLog = {
            ...entry,
            timeSincePreviousDump: this.msToMinutes(entry.lastModified - nextEntry.lastModified)
          };

          if (!result.timeSincePreviousDump || result.timeSincePreviousDump <= 0) {
            return;
          }
          if (!this.minTime || this.minTime > this.msToMinutes(entry.timeSincePreviousDump)) {
            this.minTime = this.msToMinutes(entry.timeSincePreviousDump);
          }
          if (!this.maxTime || this.maxTime < this.msToMinutes(entry.timeSincePreviousDump)) {
            this.maxTime = this.msToMinutes(entry.timeSincePreviousDump);
          }

          avgBase += this.msToMinutes(entry.timeSincePreviousDump);

          this.entries.push(result);
        }
      });

    this.avgTime = avgBase / this.entries.length;
  }

  msToMinutes(time: number): number {
    return Math.round(time / 1000 / 60);
  }
}