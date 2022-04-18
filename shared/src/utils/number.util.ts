export class NumberUtil {
  static format(num: number, limitDecimals = true): string {
    return (limitDecimals && num && num.toFixed ? num.toFixed(2) : num.toString())
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  static getUpperAndLowerThreshold(series: number[][]): {min: number, max: number} {
    let avg = 0;
    let max = 0;
    series.forEach(([ts, value]) => {
      if (avg) {
        avg = (avg + value) / 2;
      } else {
        avg = value;
      }
      if (value > max) {
        max = value;
      }
    });
    const bottom = avg * -4;
    const min = bottom > 0 ? bottom : 0;
    const multipliedMax = avg * 4;

    return {min, max: multipliedMax > max ? max : multipliedMax};
  }
}
