import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {SharedService} from '../../../../services/shared.service';
import {Character} from '../../models/character.model';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {CharacterService} from '../../services/character.service';
import {CraftingUtil} from '../../../crafting/utils/crafting.util';
import {AuctionsService} from '../../../../services/auctions.service';

@Component({
  selector: 'wah-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss']
})
export class CharacterComponent implements OnDestroy {
  @Input() index: number;
  @Input() character: Character;
  @Input() minimal: boolean;
  @Input() disallowDelete: boolean;
  @Input() region: string;
  @Output() hasUpdatedCharacter: EventEmitter<boolean> = new EventEmitter<boolean>();

  sm = new SubscriptionManager();
  isUpdating: boolean;

  constructor(private service: CharacterService,
              private auctionService: AuctionsService) {
  }

  ngOnDestroy() {
    this.sm.unsubscribe();
  }

  getAvatar(): string {
    return `url(${this.character.media.avatar})`;
  }

  getBackgroundImage() {
    if (this.character.media) {
      return 'url(' + this.character.media.main + ')';
    }
    return '';
  }

  getRegion(): string {
    return SharedService.user.region ? SharedService.user.region : this.region;
  }

  remove() {
    this.service.remove(this.character)
      .then(async () => {
        this.organizeAuctions()
          .catch(console.error);
      })
      .catch(() => {
        this.organizeAuctions()
          .catch(console.error);
      });
  }

  update() {
    this.isUpdating = true;
    this.service.update(this.character)
      .then(async () => {
        this.isUpdating = false;
        this.organizeAuctions()
          .catch(console.error);
      })
      .catch(() => {
        this.isUpdating = false;
        this.organizeAuctions()
          .catch(console.error);
      });
  }

  private async organizeAuctions() {
    if (SharedService.user.region && SharedService.user.realm) {
      await this.auctionService.organize()
        .then(() =>
          CraftingUtil.calculateCost(false, this.auctionService.mapped.value))
        .catch(console.error);
    }
  }
}
