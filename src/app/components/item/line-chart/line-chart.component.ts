import { Component, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { Auction } from '../../../models/auction/auction';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'wah-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements AfterViewInit {
  @Input() data: Array<Auction>;
  @ViewChild('svgElement') svgElement: ElementRef;
  constructor() { }

  /* istanbul ignore next */
  ngAfterViewInit() {
    console.log(this.svgElement);
    const svg = d3.select('svg'),
      margin = { top: 20, right: 20, bottom: 30, left: 50 },
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom,
      g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const x = d3.scaleTime()
      .rangeRound([0, width]);

    const y = d3.scaleLinear()
      .rangeRound([height, 0]);

    const line = d3.line()
      .x((d, i) => {
        return x(i);
      })
      .y((d) => {
        return y(d.buyout / d.quantity / 10000);
      });

    x.domain(
      d3.extent(
        this.data, (d, i) => {
          return i;
        }));
    y.domain(
      d3.extent(
        this.data, (d) => {
          return d.buyout / d.quantity / 10000;
        }));

    g.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .select('.domain')
      .remove();

    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('fill', this.getColor())
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Buyout');

    g.append('path')
      .datum(this.data.filter(d => d.buyout > 0))
      .attr('fill', 'none')
      .attr('stroke', this.getColor())
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('d', line);
  }

  /* istanbul ignore next */
  getColor(): string {
    return SharedService.user.isDarkMode ? 'white' : 'black';
  }

  /* istanbul ignore next */
  getWidth(): number {
    return this.svgElement.nativeElement.parentElement.offsetWidth;
  }
}
