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
  static list: BehaviorSubject<DashboardV2[]> = new BehaviorSubject<DashboardV2[]>([]);
  static map: BehaviorSubject<Map<string, DashboardV2>> = new BehaviorSubject<Map<string, DashboardV2>>(new Map<string, DashboardV2>());

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
    DashboardService.list.value.forEach(board => {
      DashboardCalculateUtil.calculate(board, map);
      DashboardService.map.value.set(board.id, board);
    });
    console.log('Dashboard shits', DashboardService.list.value);
  }

  private restore(): void {
    DashboardService.list.next([{
      id: 'asd-dsa',
      idParam: 'id',
      title: 'test',
      columns: [{
        key: 'name',
        title: 'Name',
        dataType: '',
      }, {
        key: 'buyout',
        title: 'Buyout',
        dataType: 'gold',
      }, {
        key: 'source.recipe.known.0.roi',
        title: 'roi',
        dataType: 'gold'
      }],
      rules: [{
        condition: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
        targetValueType: TargetValueEnum.PERCENT,
        field: 'source.recipe.known.0.cost',
        toValue: 1,
        toField: 'buyout'
      }],
      data: []
    }]);
  }

  save(): void {
  }

  saveAll(): void {
  }
}
