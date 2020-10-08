import {Component} from '@angular/core';
import {AuctionsService} from '../services/auctions.service';

@Component({
  selector: 'wah-mock',
  template: ``
})
export class MockComponent {
  constructor(public auctionsService: AuctionsService) {
  }
}
