import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'wah-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {

  @Input() id: number;
  @Input() petSpeciesId: number;
  @Input() size = 32;

  defaultIcon = 'inv_scroll_03';

  constructor(private _sanitizer: DomSanitizer) { }

  getIconStyle(): SafeResourceUrl {
    return this._sanitizer.bypassSecurityTrustStyle(
      `url('https://render-eu.worldofwarcraft.com/icons/56/${
        this.getIcon()
      }.jpg')`);
  }

  getIcon(): string {
    if (this.petSpeciesId) {
      return SharedService.pets[this.petSpeciesId] ?
        SharedService.pets[this.petSpeciesId].icon : this.defaultIcon;
    } else {
      return SharedService.items[this.id] ?
        SharedService.items[this.id].icon : this.defaultIcon;
    }
  }
}
