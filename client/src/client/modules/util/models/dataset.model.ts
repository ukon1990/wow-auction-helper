export interface Dataset {
  label: string;
  data: any[];
  yAxisID: 'yAxes-1' | 'yAxes-2';
  backgroundColor?: string;
  borderColor?: string;
  order?: number;
  type: 'line' | 'radar' | 'bar';
  fill?: 'origin' | string | false | number;
}
