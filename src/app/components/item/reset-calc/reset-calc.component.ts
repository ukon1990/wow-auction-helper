import { Component, Input, OnInit , OnDestroy } from '@angular/core';
import { Auction } from '../../../models/auction/auction';
import { AuctionItem } from '../../../models/auction/auction-item';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'wah-reset-calc',
  templateUrl: './reset-calc.component.html',
  styleUrls: ['./reset-calc.component.scss']
})
export class ResetCalcComponent implements OnInit, OnDestroy {
  @Input() auctionItem: AuctionItem;
  form: FormControl = new FormControl(0);
  resetPrice = {
    numOfAuctions: 0,
    numOfItems: 0,
    cost: 0,
    roi: 0
  };

  formChanges: Subscription;

  constructor() {
    this.formChanges = this.form.valueChanges.subscribe(() => {
      console.log('shit', this.form.value);
      this.calculate();
    });
  }

  ngOnInit(): void {
    if (this.auctionItem) {
      this.form.setValue(this.auctionItem.mktPrice / 10000);
    }
  }

  ngOnDestroy(): void {
    this.formChanges.unsubscribe();
  }

  calculate(): void {
    if (!this.form.value) {
      return;
    }
    this.resetPrice.numOfAuctions = 0;
    this.resetPrice.numOfItems = 0;
    this.resetPrice.cost = 0;
    this.resetPrice.roi = 0;

    this.auctionItem.auctions.forEach((a) => {
      if (a.buyout / a.quantity < (this.form.value * 10000)) {
        this.resetPrice.cost += a.buyout;
        this.resetPrice.numOfItems += a.quantity;
        this.resetPrice.numOfAuctions++;
      } else {
        return;
      }
    });

    this.resetPrice.roi = (this.form.value * 10000) * this.resetPrice.numOfItems - this.resetPrice.cost;
  }

}
