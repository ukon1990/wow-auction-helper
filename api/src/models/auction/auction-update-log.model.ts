export interface AuctionUpdateLogEntry {
  id: number;
  ahId: number;
  lastModified: number;
  url: string;
  timeSincePreviousDump: number;
  size: number;
}

export class AuctionUpdateLog {
  public minTime = 0;
  public avgTime = 0;
  public maxTime = 0;
  public lastModified: number;

  constructor(public entries: AuctionUpdateLogEntry[]) {
    this.calculateDiff();
    this.lastModified = this.entries[0].lastModified;
  }

  private calculateDiff() {
    let avgBase = 0;
    this.entries.forEach(entry => {
      if (!entry.timeSincePreviousDump || entry.timeSincePreviousDump <= 0) {
        return;
      }
      if (!this.minTime || this.minTime > this.msToMinutes(entry)) {
        this.minTime = this.msToMinutes(entry);
      }
      if (!this.maxTime || this.maxTime < this.msToMinutes(entry)) {
        this.maxTime = this.msToMinutes(entry);
      }

      avgBase += this.msToMinutes(entry);
    });

    this.avgTime = avgBase / this.entries.length;
  }

  msToMinutes({timeSincePreviousDump}: AuctionUpdateLogEntry): number {
    return Math.round(timeSincePreviousDump / 1000 / 60);
  }
}
