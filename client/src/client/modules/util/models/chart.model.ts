import {Dataset} from './dataset.model';

export interface ChartData {
  labels: string[];
  labelCallback: Function;
  datasets: Dataset[];
}
