import {TimeUtil} from './time.util';

describe('getStartOfTodayForTimeZone', () => {
  const exampleDate = new Date('2020-12-24T15:30:00.000Z');

  const getLocalTime = (date: Date, timezone: string): string => Intl.DateTimeFormat([], {
    hour: 'numeric',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: timezone
  }).format(date);

  it('America/Los_Angeles', () => {
    const tz = 'America/Los_Angeles';
    const res: Date = new TimeUtil().getStartOfTodayForTimeZone(tz, exampleDate);
    expect(res).toEqual(new Date('2020-12-24T08:00:00.000Z'));
    expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
  });

  it('America/Denver', () => {
    const tz = 'America/Denver';
    const res: Date = new TimeUtil().getStartOfTodayForTimeZone(tz, exampleDate);
    expect(res).toEqual(new Date('2020-12-24T07:00:00.000Z'));
    expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
  });

  it('America/Chicago', () => {
    const tz = 'America/Chicago';
    const res: Date = new TimeUtil().getStartOfTodayForTimeZone(tz, exampleDate);
    expect(res).toEqual(new Date('2020-12-24T06:00:00.000Z'));
    expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
  });

  it('America/New_York', () => {
    const tz = 'America/New_York';
    const res: Date = new TimeUtil().getStartOfTodayForTimeZone(tz, exampleDate);
    expect(res).toEqual(new Date('2020-12-24T05:00:00.000Z'));
    expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
  });

  it('America/Sao_Paulo', () => {
    const tz = 'America/Sao_Paulo';
    const res: Date = new TimeUtil().getStartOfTodayForTimeZone(tz, exampleDate);
    expect(res).toEqual(new Date('2020-12-24T03:00:00.000Z'));
    expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
  });

  it('Europe/Paris', () => {
    const tz = 'Europe/Paris';
    const res: Date = new TimeUtil().getStartOfTodayForTimeZone(tz, exampleDate);
    expect(res).toEqual(new Date('2020-12-23T23:00:00.000Z'));
    expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
  });
  it('Asia/Taipei', () => {
    const tz = 'Asia/Taipei';
    const res: Date = new TimeUtil().getStartOfTodayForTimeZone(tz, exampleDate);
    expect(res).toEqual(new Date('2020-12-23T16:00:00.000Z'));
    expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
  });
  it('Asia/Seoul', () => {
    const tz = 'Asia/Seoul';
    const res: Date = new TimeUtil().getStartOfTodayForTimeZone(tz, exampleDate);
    expect(res).toEqual(new Date('2020-12-23T15:00:00.000Z'));
    expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
  });
  it('Australia/Melbourne', () => {
    const tz = 'Australia/Melbourne';
    const res: Date = new TimeUtil().getStartOfTodayForTimeZone(tz, exampleDate);
    expect(res).toEqual(new Date('2020-12-23T13:00:00.000Z'));
    expect(getLocalTime(res, tz)).toEqual('12/24/2020, 12 AM');
  });
});
