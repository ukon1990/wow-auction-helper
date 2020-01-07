import {Component, Input, OnInit} from '@angular/core';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {SharedService} from '../../../../services/shared.service';

@Component({
  selector: 'wah-auction-item-details',
  templateUrl: './auction-item-details.component.html',
  styleUrls: ['./auction-item-details.component.scss']
})
export class AuctionItemDetailsComponent implements OnInit {
  @Input() item: AuctionItem;
  isUsing3PAPI: boolean = SharedService.user.apiToUse !== 'none';

  constructor() { }

  ngOnInit() {
  }

  isMobile(): boolean {
    return window.matchMedia('(max-width: 767px)').matches;
  }
}
