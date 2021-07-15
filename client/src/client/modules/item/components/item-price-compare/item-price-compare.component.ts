import {Component, Input, OnInit} from '@angular/core';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {Item} from '../../../../models/item/item';
import {ItemService} from '../../../../services/item.service';
import {RealmService} from '../../../../services/realm.service';

@Component({
  selector: 'wah-item-price-compare',
  templateUrl: './item-price-compare.component.html',
  styleUrls: ['./item-price-compare.component.scss']
})
export class ItemPriceCompareComponent implements OnInit {
  @Input() item: Item;
  @Input() auctionItem: AuctionItem;

  constructor(private service: ItemService, private realmService: RealmService) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.service.getComparablePrices(
      {
        itemId: this.item.id,
        petSpeciesId: this.auctionItem.petSpeciesId || -1,
        bonusIds: this.auctionItem.bonusIds
      },
      this.realmService.events.realmStatus.value,
      this.realmService.events.list.value,
    )
      .then(console.log)
      .catch(console.error);
  }
}
