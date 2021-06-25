import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {Tooltip} from '../models/tooltip.model';
import {DomSanitizer} from '@angular/platform-browser';
import {Report} from '../../../utils/report.util';

@Injectable({
  providedIn: 'root'
})
export class TooltipService {
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  tooltips: BehaviorSubject<Map<string, Tooltip>> = new BehaviorSubject<Map<string, Tooltip>>(new Map());
  activeTooltip: BehaviorSubject<Tooltip> = new BehaviorSubject<Tooltip>(undefined);

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  clearTooltip(): void {
    this.activeTooltip.next(undefined);
  }

  get(type: string, id: number, bonusIds: number[], isClassic: boolean, event: MouseEvent, item: any, extra: string): Promise<Element> {
    const map = this.tooltips.value;
    const locale = (localStorage.getItem('locale') || 'en').split('_')[0];
    let url = `https://${isClassic ? 'tbc' : 'www'}.wowhead.com/tooltip/${type}/${id}?locale=${locale}`;
    if (bonusIds && bonusIds.length) {
      url += '&bonus=' + bonusIds.join(':');
    }
    const x = event.clientX + 30;
    const y = event.clientY;
    return new Promise((resolve, reject) => {
      if (map.has(url)) {
        const tip = map.get(url);
        tip.x = x;
        tip.y = y;
        tip.data = item;
        this.tooltips.next(map);
        this.activeTooltip.next(tip);
        resolve(map.get(url).body as Element);
      } else {
        this.http.get(url)
          .toPromise()
          .then(({tooltip}: {tooltip: any}) => {
            const tip: Tooltip = {
              id,
              bonusIds,
              x,
              y,
              type: type,
              body: tooltip ? this.sanitizer.bypassSecurityTrustHtml(tooltip) : undefined,
              data: item,
              extra: extra ? this.sanitizer.bypassSecurityTrustHtml(extra) : undefined,
            };
            map.set(url, tip);
            this.tooltips.next(map);
            this.activeTooltip.next(tip);
            resolve(tooltip as Element);
          })
          .catch(reject);
      }
    });
  }
}
