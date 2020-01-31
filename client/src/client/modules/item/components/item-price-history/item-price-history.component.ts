import {AfterViewInit, Component, Input} from '@angular/core';
import {Item} from '../../../../models/item/item';
import {ItemService} from '../../../../services/item.service';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {ItemPriceEntry} from '../../models/item-price-entry.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {SummaryCard} from '../../../../models/summary-card.model';
import {ErrorReport} from '../../../../utils/error-report.util';
import {Report} from '../../../../utils/report.util';
import {GoldPipe} from '../../../util/pipes/gold.pipe';
import {Dataset} from '../../../util/models/dataset.model';
import {ChartData} from '../../../util/models/chart.model';
import {NumberUtil} from '../../../util/utils/number.util';

@Component({
  selector: 'wah-item-price-history',
  templateUrl: './item-price-history.component.html',
  styleUrls: ['./item-price-history.component.scss']
})
export class ItemPriceHistoryComponent implements AfterViewInit {
  @Input() item: Item;
  @Input() auctionItem: AuctionItem;
  sm = new SubscriptionManager();
  chartData: SummaryCard = new SummaryCard('', '');
  priceHistory: ItemPriceEntry[] = [];
  dailyData: ChartData = {
    labels: [],
    datasets: [],
    labelCallback: this.tooltipCallback
  };
  isLoading = true;

  constructor(private service: ItemService) {
  }

  ngAfterViewInit() {
    this.isLoading = true;
    this.service.getPriceHistory(this.item.id, this.auctionItem.petSpeciesId, this.auctionItem.bonusIds)
      .then((history) => {
        this.priceHistory = history;
        this.setAuctionAndDataset();
        this.isLoading = false;
      })
      .catch((error) => {
        this.setAuctionAndDataset();
        this.isLoading = false;
        this.priceHistory = [];
        ErrorReport.sendHttpError(error);
      });
  }

  private setAuctionAndDataset() {
    this.dailyData.labels.length = 0;
    this.dailyData.datasets = [];
    this.dailyData.datasets.push({
      label: 'Price',
      data: [],
      type: 'line',
      yAxisID: 'yAxes-1',
      backgroundColor: 'rgba(0, 255, 22, 0.4)'
    });
    this.dailyData.datasets.push({
      label: 'Quantity',
      data: [],
      type: 'line',
      yAxisID: 'yAxes-2',
      backgroundColor: 'hsla(0, 100%, 50%, 0.33)'
    });

    if (this.priceHistory && this.priceHistory.length) {
      this.priceHistory = this.priceHistory.sort((a, b) =>
        a.timestamp - b.timestamp);
      this.priceHistory.forEach((entry) => {
        const date = new Date(entry.timestamp);
        this.dailyData.datasets[0].data.push(entry.min / 10000);
        this.dailyData.datasets[1].data.push(entry.quantity);
        this.dailyData.labels.push(date.toLocaleString());
      });
    }
    Report.debug('setAuctionAndDataset', {chart: this.chartData, data: this.priceHistory});
  }

  tooltipCallback(items, data): string {
    const {index, datasetIndex} = items;
    return 'Price: ' + new GoldPipe().transform(data.datasets[0].data[index] * 10000) +
      ' | Quantity: ' + NumberUtil.format(data.datasets[1].data[index]);
  }
}
