import {ChartData} from '../../util/models/chart.model';
import {SeriesOptionsType} from 'highcharts';
import {GlobalStatus} from "@shared/models/log";

export class MonitorUtil {
  static getDataset(statuses: GlobalStatus[], series: SeriesOptionsType[]): void {
    const map = {};
    const list = [];
    statuses.forEach(status => {
      const time = `${status.timestamp.getHours()}:${status.timestamp.getMinutes()}`;
      if (!map[time]) {
        map[time] = {
          ...status,
          min: status.Threads_connected,
          avg: status.Threads_connected,
          max: status.Threads_connected,
        };
        list.push(map[time]);
      } else {
        if (status.Threads_connected < map[time].min) {
          map[time].min = status.Threads_connected;
        }

        if (status.Threads_connected > map[time].max) {
          map[time].max = status.Threads_connected;
        }
        map[time].avg = (map[time].avg + status.Threads_connected) / 2;
      }
    });

    series.forEach(serie => serie['data'].length = 0);
    list.forEach(status => {
      const time = `${status.timestamp.getUTCHours()}:${status.timestamp.getUTCMinutes()}`;
      series[0]['data'].push([+status.timestamp, status.min, status.max]);
      series[1]['data'].push([+status.timestamp, status.avg]);
    });
  }
}