import { Component, OnInit } from '@angular/core';
import { UserAuctions, UserAuctionCharacter } from '../../../models/auction/user-auctions';
import { SharedService } from '../../../services/shared.service';
import { Auction } from '../../../models/auction/auction';

@Component({
  selector: 'wah-my-auctions',
  templateUrl: './my-auctions.component.html',
  styleUrls: ['./my-auctions.component.scss']
})
export class MyAuctionsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  getUserAuctions(): Array<Auction> {
    return SharedService.userAuctions.auctions;
  }

  getUserAuctionsCharacters(): Array<UserAuctionCharacter> {
    return SharedService.userAuctions.characters ? SharedService.userAuctions.characters : [];
  }
}
