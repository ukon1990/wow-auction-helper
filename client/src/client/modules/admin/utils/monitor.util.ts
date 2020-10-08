import {GlobalStatus} from '../../../../../../api/src/logs/model';
import {ChartData} from '../../util/models/chart.model';

export class MonitorUtil {
  static getDataset(statuses: GlobalStatus[]): ChartData {
    const labels: string[] = [];
    const min: number[] = [];
    const avg: number[] = [];
    const max: number[] = [];
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
    list.forEach(status => {
      const time = `${status.timestamp.getUTCHours()}:${status.timestamp.getUTCMinutes()}`;
      labels.push(time);
      min.push(status.min);
      avg.push(status.avg);
      max.push(status.max);
    });

    return {
      labels,
      axisLabels: {
        yAxis1: 'Connections',
      },
      datasets: [{
        label: 'Min',
        data: min,
        type: 'line',
        fill: 2,
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(0, 255, 22, 0.4)'
      }, {
        label: 'Avg',
        data: avg,
        type: 'line',
        fill: 1,
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(255, 144, 0, 0.78)'
      }, {
        label: 'Max',
        data: max,
        type: 'line',
        fill: 0,
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(0, 173, 255, 0.61)'
      }]
    };
  }
}
