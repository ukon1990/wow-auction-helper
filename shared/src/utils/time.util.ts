import {TimeZone} from '@shared/enum';

export class TimeUtil {

  /**
   * Calculating at what time 00:00 was in the given timezone today
   * @param timezone
   * @param date
   */
  getStartOfTodayForTimeZone(timezone: string, date = new Date()): Date {
    const offsetHours = +TimeZone[timezone];

    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);

    return new Date(+date - offsetHours * 60 * 60 * 1000);
  }

  getDateAtNDaysSinceNow(timeSince: number, startOfDay = false): Date {
    const day = timeSince * (24 * 60 * 60 * 1000);
    const date = new Date(+new Date() - day);
    if (startOfDay) {
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
    }
    return date;
  }
}
