import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { SharedService } from '../../../../services/shared.service';
import { User } from '../../../../models/user/user';
import {CraftingUtil} from '../../../crafting/utils/crafting.util';

@Component({
  selector: 'wah-crafting-settings',
  templateUrl: './crafting-settings.component.html',
  styleUrls: ['./crafting-settings.component.scss']
})
export class CraftingSettingsComponent {
  buyoutController: FormControl = new FormControl();
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      buyoutLimit: new FormControl(
        SharedService.user.buyoutLimit),
      useVendorPriceForCraftingIfAvailable: new FormControl(
        SharedService.user.useVendorPriceForCraftingIfAvailable)
    });
    this.form.valueChanges
      .subscribe((data) => {
        Object.keys(data).forEach(key =>
          SharedService.user[key] = data[key]);
        User.save();
        CraftingUtil.calculateCost();
      });
  }
}
