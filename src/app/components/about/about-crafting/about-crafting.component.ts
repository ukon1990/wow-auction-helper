import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'wah-about-crafting',
  templateUrl: './about-crafting.component.html',
  styleUrls: ['./about-crafting.component.scss']
})
export class AboutCraftingComponent {
  getBuyoutLimit(): number {
    return SharedService.user.buyoutLimit;
  }
}
