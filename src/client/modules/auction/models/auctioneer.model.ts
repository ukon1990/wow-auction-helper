export class Auctioneer {
  id: number;
  name: string;
  owner: string;
  ownerRealm: string;
  faction: number;
  buyout: number;
  quantity: number;
  // stdDev: number[];
  // histogram: number[];

}

class StDev {
  /**
   * "Average", "Mean", false, "Std Deviation", "Variance", "Count", "Confidence"
   * 5;950/10;285/3
   * 5c, 950c/10, 285c/3
   */
  // average, mean, _, stdev, variance, count, confidence
  average: number;
  mean: number;
  stdev: number;
  variance: number;
  count: number;
  confidence: number;
  constructor(csvRow: string) {

  }
}
