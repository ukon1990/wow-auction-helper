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
  @Input() size: number;

  constructor(private _sanitizer: DomSanitizer) { }

  getIcon(): SafeResourceUrl {
    return this._sanitizer.bypassSecurityTrustStyle(
      `url('https://render-eu.worldofwarcraft.com/icons/56/${
      SharedService.items[this.id] ? SharedService.items[this.id].icon : 'inv_scroll_03'
    }.jpg')`);
  }
}
