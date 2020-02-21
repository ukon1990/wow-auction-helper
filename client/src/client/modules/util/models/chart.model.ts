import {Dataset} from './dataset.model';

export interface ChartData {
  labels: string[];
  axisLabels?: {
    yAxis1?: string,
    yAxis2?: string;
    xAxis?: string;
  };
  labelCallback?: Function;
  datasets: Dataset[];
}
