import { GoldPipe } from './gold.pipe';

describe('GoldPipe', () => {
  it('should display propperly', () => {
    const pipe = new GoldPipe();
    expect(pipe.transform(10000)).toEqual('1g 0s 0c');
  });

  it('should work with 0 value', () => {
    const pipe = new GoldPipe();
    expect(pipe.transform(0)).toEqual('0g 0s 0c');
  });

  it('should handle undefined value as 0', () => {
    const pipe = new GoldPipe();
    expect(pipe.transform(undefined)).toEqual('0g 0s 0c');
  });

  it('should handle null value as 0', () => {
    const pipe = new GoldPipe();
    expect(pipe.transform(null)).toEqual('0g 0s 0c');
  });
});
