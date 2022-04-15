export class QualityUtil {
  /* istanbul ignore next */
  static get(quality: string): number {
    switch (quality) {
      case 'POOR':
        return 0;
      case 'COMMON':
        return 1;
      case 'UNCOMMON':
        return 2;
      case 'RARE':
        return 3;
      case 'EPIC':
        return 4;
      case 'LEGENDARY':
        return 5;
    }
  }
}