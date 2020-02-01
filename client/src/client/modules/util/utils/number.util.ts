export class NumberUtil {
  static format(num: number, limitDecimals = true): string {
    return (limitDecimals ? num.toFixed(2) : num.toString())
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}
