import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SharedService } from '../../../services/shared.service';
import { User } from '../../../models/user/user';

@Component({
  selector: 'wah-crafting-settings',
  templateUrl: './crafting-settings.component.html',
  styleUrls: ['./crafting-settings.component.scss']
})
export class CraftingSettingsComponent {
  buyoutController: FormControl = new FormControl();

  constructor() {
    this.buyoutController.setValue(SharedService.user.buyoutLimit);
    this.buyoutController.valueChanges
      .subscribe(() => {
        SharedService.user.buyoutLimit = this.buyoutController.value;
        User.save();
      });
  }
}
