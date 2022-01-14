import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';
import {
  Axis,
  AxisTypeValue,
  Chart,
  SeriesOptionsType,
  Tooltip,
  TooltipFormatterContextObject,
  XAxisOptions,
  YAxisOptions,
  PointOptionsObject
} from 'highcharts';
import addMore from 'highcharts/highcharts-more';
import {NumberUtil} from '../utils/number.util';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {ThemeUtil} from '../../core/utils/theme.util';
import {GoldPipe} from '../pipes/gold.pipe';

addMore(Highcharts);

@Component({
  selector: 'wah-highcharts',
  template: `
    <ng-container *ngIf="series && series.length && series[0]['data'].length; else noEntriesTemplate">
      <highcharts-chart
        [Highcharts]="Highcharts"
        [options]="options"
        [update]="update"
        (updateChange)="updateChange.emit($event)"
        [style.width]="width"
        [style.height]="height"
        [style.display]="'block'"
        (chartInstance)="chartInstance.emit($event)"
      ></highcharts-chart>
    </ng-container>

    <ng-template #noEntriesTemplate>
      There are no entries in this dataset
    </ng-template>
  `
})
export class HighchartsComponent implements OnChanges, OnDestroy {
  /**
   * TODO: Calculate outliers and find a way to set the "min and max" value from there
   * Allow the user to select linear or logarithmic graph
   * @private
   */
  private goldPipe = new GoldPipe();
  Highcharts: typeof Highcharts = Highcharts;
  isReady: boolean;
  @Input() autoSetMinMax = true;
  @Input() height = '20em';
  @Input() width = '100%';
  @Input() title: string;
  @Input() axisType: AxisTypeValue = 'linear';
  @Input() tooltipFormatter: (tip?: Tooltip) => string = this.defaultTooltip;
  @Input() options: Highcharts.Options = {
    title: {
      text: ''
    },
    chart: {
      zoomType: 'x',
      panning: {
        enabled: true,
      },
      panKey: 'ctrl'
    },
    xAxis: {
      type: 'datetime',
      crosshair: true
    },
    yAxis: [
      { // Primary yAxis
        type: this.axisType,
        labels: {
          format: '{value}',
          formatter: ({value}) => this.goldPipe.transform(+value),
        },
        title: {
          text: 'Gold',
        },
        opposite: true
      }, {
        type: this.axisType,
        title: {
          text: 'Quantity',
        },
        labels: {
          format: '{value} qty',
          formatter: ({value}) => NumberUtil.format(+value),
        },
      }
    ],
    tooltip: {
      shared: true,
      formatter: this.tooltipFormatter,
    },
    legend: {
      layout: 'vertical',
      align: 'left',
      x: 120,
      verticalAlign: 'top',
      y: 100,
      floating: true,
    },
    series: [],
  };
  @Input() yAxis: (YAxisOptions | YAxisOptions[]);
  @Input() xAxis: (XAxisOptions | XAxisOptions[]);
  @Input() series: SeriesOptionsType[] = [];
  @Input() update: boolean;
  @Output() updateChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() chartInstance: EventEmitter<Highcharts.Chart> = new EventEmitter<Chart>();

  private sm = new SubscriptionManager();

  constructor() {
    this.sm.add(ThemeUtil.chartThemeChange, (options) => {
      Highcharts.setOptions(options);
      this.update = true;
    });
  }

  ngOnChanges({title, yAxis, xAxis, series, update, tooltipFormatter}: SimpleChanges): void {
    if (title && title.currentValue) {
      this.options.title = title.currentValue;
    }

    if (yAxis && yAxis.currentValue) {
      this.options.yAxis = yAxis.currentValue;
    }

    if (xAxis && xAxis.currentValue) {
      this.options.xAxis = xAxis.currentValue;
    }

    if (series && series.currentValue) {
      this.options.series = series.currentValue;

      if (this.autoSetMinMax) {
        if (Array.isArray(this.options.yAxis)) {
          this.options.yAxis.forEach((axis, index) => {
            this.options.series.forEach((s: any) => {
              if (s.yAxis === index || !index && !s.yAxis) {
                const minMax = NumberUtil.getUpperAndLowerThreshold(s.data);
                if (minMax.min < axis.min || !axis.min) {
                  axis.min = minMax.min;
                }
                if (axis.max < minMax.max || !axis.max) {
                  axis.max = minMax.max;
                }
              }
            });

            if (axis.min === 0) {
              delete axis.min;
            }
            if (axis.max === 0) {
              delete axis.max;
            }
          });
        } else {

        }
      }
    }

    if (tooltipFormatter && tooltipFormatter.currentValue) {
      this.options.tooltip = tooltipFormatter.currentValue;
    }

    if (!update) {
      this.update = true;
    }
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  private defaultTooltip(): string {
    const getFormatter = (point: TooltipFormatterContextObject, axis: 'yAxis' | 'xAxis' = 'yAxis'): any => {
      try {
        if (point && point.series[axis]) {
          const seriesAxis: Axis = point.series[axis];
          const labelFormatter = seriesAxis['labelFormatter'];
          if (labelFormatter) {
            return labelFormatter;
          }
          return seriesAxis.defaultLabelFormatter;
        }
      } catch (error) {}
      return undefined;
    };

    // @ts-ignore
    const points: TooltipFormatterContextObject[] = this.points;
    const firstPoint: TooltipFormatterContextObject = points[0];
    const firstPointXFormatter = getFormatter(firstPoint, 'xAxis');
    const isDateTime: boolean = firstPoint.series.xAxis.userOptions.type === 'datetime';
    const isxAxisVisible = firstPoint.series.xAxis['visible'];
    let tip = '';

    const setTip = () => {
      if (isDateTime) {
        tip += new Date(firstPoint.x).toLocaleString();
      } else {
        tip += firstPoint.x;
      }
    };

    try {
      if (isxAxisVisible) {
        tip += '<strong>';
        if (firstPointXFormatter) {
          try {
            tip += firstPointXFormatter({value: firstPoint.x});
          } catch (e) {
            setTip();
          }
        } else {
          setTip();
        }
        tip += '</strongh><br />';
      }
      points.forEach(point => {
        const formatter = getFormatter(point);
        const label = point.series.name;
        tip += `
        <span style="color: ${point.color}">${label}</span>
      `;
        if (!isNaN(point.y)) {
          if ((point.point as PointOptionsObject).low && (point.point as PointOptionsObject).high) {
            tip += `${formatter({
              value: (point.point as PointOptionsObject).low
            })} - ${
              formatter({
                value: (point.point as PointOptionsObject).high
              })
            }`;
          } else {
            tip += formatter({value: point.y});
          }
        } else {
          tip += point.y;
        }
        tip += '<br />';
      });
    } catch (error) {
      console.error(error);
    }
    return tip;
  }
}
