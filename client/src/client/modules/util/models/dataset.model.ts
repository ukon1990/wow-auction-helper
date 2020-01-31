export interface Dataset {
  label: string;
  data: any[];
  yAxisID: 'yAxes-1' | 'yAxes-2';
  backgroundColor?: string;
  borderColor?: string;
  order?: number;
  type: 'line' | 'radar' | 'bar';
  fill?: 'origin' | '+2' | '1' | false | '-2';
}
