import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {TooltipService} from '../../services/tooltip.service';
import {Subscription} from 'rxjs';
import {Tooltip} from '../../models/tooltip.model';
import {RealmService} from '../../../../services/realm.service';
import {Recipe} from '../../../crafting/models/recipe';
import {AuctionItem} from '../../../auction/models/auction-item.model';
import {ThemeUtil} from '../../utils/theme.util';
import {Report} from "../../../../utils/report.util";
import {CraftingService} from "../../../../services/crafting.service";

@Component({
  selector: 'wah-tooltip',
  templateUrl: 'tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit, OnDestroy {
  private activeTooltipSub: Subscription = new Subscription();
  currentTheme = ThemeUtil.current;
  locale = 'en';
  isClassic = false;
  activeTooltip: Tooltip;
  recipes: Recipe[];
  recipeId: number;

  constructor(
    private service: TooltipService,
    private realmService: RealmService,
    private element: ElementRef
  ) {
  }

  ngOnInit(): void {
    this.activeTooltipSub.add(this.service.activeTooltip.subscribe(tooltip => {

      this.locale = (localStorage.getItem('locale') || 'en').split('_')[0];
      this.isClassic = this.realmService.isClassic;
      this.recipes = undefined;
      this.recipeId = undefined;
      if (tooltip) {
       try {
         if ((tooltip.data as Recipe).reagents && (tooltip.data as Recipe).reagents.length) {
           this.recipes = [tooltip.data as Recipe];
         } else if (this.hasRecipeSource(tooltip.data as AuctionItem)) {
           this.recipes = this.sliceAndSortByROI((tooltip.data as AuctionItem).source.recipe.all);
         } else if ((tooltip.data as any).recipeId) {
           // For dashboards
           this.recipeId = +(tooltip.data as any).recipeId;
           if (this.recipeId && !this.recipes) {
             this.recipes = [CraftingService.map.value.get(this.recipeId)];
           }
         } else if ((tooltip.data as any).recipe) {
           this.recipes = [(tooltip.data as any).recipe];
         } else if (CraftingService.itemRecipeMap.value.has(tooltip.id)) {
           this.recipes = this.sliceAndSortByROI(CraftingService.itemRecipeMap.value.get(tooltip.id));
         }
       } catch (e) {
       }
      }
      this.activeTooltip = tooltip;
      Report.debug('TooltipComponent', tooltip);

      setTimeout(() => this.moveTooltipIfOutOfBounds());
    }));
  }

  ngOnDestroy() {
    this.activeTooltipSub.unsubscribe();
  }

  sliceAndSortByROI(recipes: Recipe[]): Recipe[] {
    return (recipes || []).sort((a, b) => b.roi - a.roi).slice(0, 2);
  }

  private moveTooltipIfOutOfBounds() {
    if (!this.activeTooltip) {
      return;
    }
    const {
      x,
      y
    } = this.activeTooltip;
    const {
      offsetHeight,
      offsetWidth
    } = this.element.nativeElement.firstChild;
    const {
      innerHeight,
      innerWidth
    } = window;


    if (y + offsetHeight >= innerHeight) {
      const diff = y + offsetHeight - innerHeight;
      this.activeTooltip.y = y - diff;
    }


    if (x + offsetWidth >= innerWidth) {
      const diff = x + offsetWidth - innerWidth;
      this.activeTooltip.x = x - diff;
    }
  }

  private hasRecipeSource(data: AuctionItem) {
    if (
      (data as AuctionItem).source &&
      (data as AuctionItem).source.recipe &&
      (data as AuctionItem).source.recipe.all &&
      (data as AuctionItem).source.recipe.all.length
    ) {
      return true;
    }
    return false;
  }
}
