import {GlobalStatus} from '../../../../../../api/src/logs/model';
import {ChartData} from '../../util/models/chart.model';

export class MonitorUtil {
  static getDataset(statuses: GlobalStatus[]): ChartData {
    const labels: string[] = [];
    const maxConnections: number[] = [];
    const connections: number[] = [];

    statuses.forEach(status => {
      labels.push(status.timestamp.toLocaleTimeString());
      maxConnections.push(status.Max_used_connections);
      connections.push(status.Threads_connected);
    });

    return {
      labels,
      axisLabels: {
        yAxis1: 'Price',
        yAxis2: 'Quantity'
      },
      datasets: [{
        label: 'Connections',
        data: connections,
        type: 'line',
        yAxisID: 'yAxes-1',
        backgroundColor: 'rgba(0, 255, 22, 0.4)'
      }, {
        label: 'Max connections',
        data: maxConnections,
        type: 'line',
        yAxisID: 'yAxes-1',
        backgroundColor: 'hsla(0, 100%, 50%, 0.33)'
      }]
    };
  }
}
