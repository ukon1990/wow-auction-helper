import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {SharedService} from '../../../../services/shared.service';

@Component({
  selector: 'wah-auction-item-details',
  templateUrl: './auction-item-details.component.html',
  styleUrls: ['./auction-item-details.component.scss']
})
export class AuctionItemDetailsComponent implements OnChanges {
  @Input() item: AuctionItem;
  @Input() dialogId: string;

  ngOnChanges({item}: SimpleChanges): void {
    if (item && item.currentValue) {
      // TODO: Fetch every version of this item
    }
  }

  isMobile(): boolean {
    return window.matchMedia('(max-width: 767px)').matches;
  }
}
