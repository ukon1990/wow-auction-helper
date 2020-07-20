import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DashboardV2} from '../models/dashboard-v2.model';
import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';
import {DashboardCalculateUtil} from '../utils/dashboard-calculate.util';
import {AuctionsService} from '../../../services/auctions.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionItem} from '../../auction/models/auction-item.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  list: BehaviorSubject<DashboardV2[]> = new BehaviorSubject<DashboardV2[]>([]);
  map: BehaviorSubject<Map<string, DashboardV2>> = new BehaviorSubject<Map<string, DashboardV2>>(new Map<string, DashboardV2>());

  private sm = new SubscriptionManager();

  constructor(private auctionsService: AuctionsService) {
    this.init();
    this.sm.add(this.auctionsService.mapped,
      (map) => this.calculateAll(map));
  }

  init(): void {
    this.restore();
    this.calculateAll();
  }

  calculateAll(map: Map<string, AuctionItem> = this.auctionsService.mapped.value): void {
    this.list.value.forEach(board => {
      DashboardCalculateUtil.calculate(board, map);
      this.map.value.set(board.id, board);
    });
    console.log('Dashboard shits', this.list.value);
  }

  private restore(): void {
    this.list.next([{
      id: 'asd-dsa',
      idParam: 'id',
      title: 'Profitable crafts',
      columns: [{
        key: 'name',
        title: 'Name',
        dataType: 'name',
      }, {
        key: 'buyout',
        title: 'Buyout',
        dataType: 'gold',
      }, {
        key: 'quantityTotal',
        title: '#',
        dataType: 'number',
      }, {
        key: 'source.recipe.all.0.roi',
        title: 'roi',
        dataType: 'gold'
      }],
      rules: [{
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: 'quantityTotal',
        toValue: 100
      }, {
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.NUMBER,
        field: 'source.recipe.all.0.roi',
        toValue: 1
      }],
      data: []
    }]);
  }

  save(): void {
  }

  saveAll(): void {
  }
}
