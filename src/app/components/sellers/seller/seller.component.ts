import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Seller } from '../../../models/seller';
import { ColumnDescription } from '../../../models/column-description';
import { CharacterService } from '../../../services/character.service';
import { Character } from '../../../models/character/character';

@Component({
  selector: 'wah-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss']
})
export class SellerComponent implements OnInit {
  character: Character;
  columns: Array<ColumnDescription> = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'timeLeft', title: 'Time left', dataType: 'time-left' },
    { key: 'buyout', title: 'Buyout/item', dataType: 'gold-per-item' },
    { key: 'buyout', title: 'Buyout', dataType: 'gold' },
    { key: 'bid', title: 'Bid/item', dataType: 'gold-per-item' },
    { key: 'bid', title: 'Bid', dataType: 'gold' },
    { key: 'quantity', title: 'Size', dataType: '' },
    { key: 'owner', title: 'Owner', dataType: '' }
  ];
  columnsSeller: Array<ColumnDescription> = [
    { key: 'liquidity', title: 'Liquidity', dataType: 'gold' },
    { key: 'volume', title: 'Volume', dataType: 'number' },
    { key: 'numOfAuctions', title: 'Auctions', dataType: 'number' }
  ];
  constructor(private _characterService: CharacterService) { }

  /* istanbul ignore next */
  ngOnInit() {
    if (SharedService.selectedSeller) {
      this._characterService.getCharacter(SharedService.selectedSeller.name, SharedService.selectedSeller.realm)
        .then(c => {
          this.character = c;
          SharedService.downloading.characterData = false;
        })
        .catch(e => {
          console.error('Could not download seller', e);
          SharedService.downloading.characterData = false;
        });
      return;
    }
  }

  isDownloadingCharacter(): boolean {
    return SharedService.downloading.characterData;
  }

  /* istanbul ignore next */
  close(): void {
    SharedService.selectedSeller = undefined;
    SharedService.events.detailPanelOpen.emit(false);
  }

  getSeller(): Seller {
    if (!SharedService.selectedSeller) {
      return undefined;
    }
    return SharedService.sellersMap[SharedService.selectedSeller.name];
  }
}
