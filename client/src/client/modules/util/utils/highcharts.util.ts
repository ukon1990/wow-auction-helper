import * as Highcharts from 'highcharts';
import {XAxisOptions} from 'highcharts';

/**
 * A datetime xAxis with formatter
 * @param dateFormat
 */
export const getXAxisDateLabel = (includeHours: boolean = false): XAxisOptions => ({
  /*
    If going back to Highcharts.dateFormat:
    Highcharts.dateFormat(dateFormat, +value)
    Old format with hour: '%H:%M %B %e, %Y'

    NOTE: Went away from it, due to time zone issue
   */
  type: 'datetime',
  labels: {
    format: '{value}',
    formatter: ({value}) =>
      includeHours ? new Date(value).toLocaleString() : new Date(value).toLocaleDateString(),
  },
  title: {
    text: null
  }
});