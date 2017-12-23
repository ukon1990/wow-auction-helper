import { Component, Input, OnInit } from '@angular/core';
import { Reagent } from '../../../models/crafting/reagent';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'wah-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {
  @Input() reagents: Array<Reagent>;

  constructor() { }

  ngOnInit() {
  }

  getAuctionItem(itemID: number) {
    // s
  }

  isAtAH(itemID: number): boolean {
    return SharedService.auctionItemsMap[itemID] ? true : false;
  }
}
