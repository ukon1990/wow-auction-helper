import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DashboardV2} from '../models/dashboard-v2.model';
import {DashboardCalculateUtil} from '../utils/dashboard-calculate.util';
import {AuctionsService} from '../../../services/auctions.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {getDefaultDashboards} from '../data/default-doards.data';
import {ErrorReport} from '../../../utils/error-report.util';
import generateUUID from '../../../utils/uuid.util';
import {ObjectUtil} from '@ukon1990/js-utilities';
import {DatabaseService} from '../../../services/database.service';
import {Report} from '../../../utils/report.util';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {ProfessionService} from '../../crafting/services/profession.service';
import {CraftingUtil} from '../../crafting/utils/crafting.util';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  calculatedBoardEvent: EventEmitter<string> = new EventEmitter<string>();
  allBoardsCalculatedEvent: BehaviorSubject<number | boolean> = new BehaviorSubject<number | boolean>(false);
  list: BehaviorSubject<DashboardV2[]> = new BehaviorSubject<DashboardV2[]>([]);
  map: BehaviorSubject<Map<string, DashboardV2>> = new BehaviorSubject<Map<string, DashboardV2>>(new Map<string, DashboardV2>());
  defaultMap: BehaviorSubject<Map<string, DashboardV2>> = new BehaviorSubject<Map<string, DashboardV2>>(new Map<string, DashboardV2>());

  private sm = new SubscriptionManager();

  constructor(private auctionsService: AuctionsService, private db: DatabaseService,
              private professionService: ProfessionService) {
    this.sm.add(this.professionService.listWithRecipes, () => {
      this.sm.unsubscribeById('auctions');

      this.init()
        .catch(error => ErrorReport.sendError('DashboardService.init', error));
      this.sm.add(this.auctionsService.mapped,
        (map) => this.calculateAll(map),
        {
          id: 'auctions'
        });
    });
  }

  async init(): Promise<void> {
    await this.restore();
    this.calculateAll();
  }

  calculateAll(map: Map<string, AuctionItem> = this.auctionsService.mapped.value): void {
    if (map.size > 0) {
      CraftingUtil.calculateCost(false, map);
      DashboardCalculateUtil.setItemSources(map);
      this.list.value.forEach(board => {
        DashboardCalculateUtil.calculate(board, map);
        this.map.value.set(board.id, board);
        this.calculatedBoardEvent.emit(board.id);
      });
      this.allBoardsCalculatedEvent.next(+new Date());
    }
  }

  private async restore(): Promise<void> {
    const defaultBoards = getDefaultDashboards(this.professionService.listWithRecipes.value);
    const dashboards: DashboardV2[] = [];
    const restoredMap: Map<string, DashboardV2> = new Map();
    const defaultMap: Map<string, DashboardV2> = new Map();
    await this.db.getDashboards()
      .then(restored => {
        restored.forEach(board => {
          dashboards.push(board);
          restoredMap.set(board.id, board);
        });
        Report.debug('DashboardService.restore', restored, this.professionService.listWithRecipes.value);
      })
      .catch(error =>
        ErrorReport.sendError('DashboardService.restore', error));

    defaultBoards.forEach(board => {
      defaultMap.set(board.id, board);
      if (!restoredMap.has(board.id)) {
        dashboards.push(ObjectUtil.clone(board) as DashboardV2);
      }
    });

    this.defaultMap.next(defaultMap);
    this.list.next(
      dashboards.sort((a, b) =>
        a.sortOrder - b.sortOrder));
    this.list.value.forEach(board =>
      this.map.value.set(board.id, board));
  }


  reset(dashboard: DashboardV2): void {
    const defaultBoards = getDefaultDashboards(this.professionService.list.value);
    for (let i = 0; i < defaultBoards.length; i++) {
      if (dashboard.id === defaultBoards[i].id) {
        this.map.value.set(dashboard.id, defaultBoards[i]);
        const list: DashboardV2[] = [];
        this.map.value.forEach(board => list.push(board));
        this.list.next(list);
        DashboardCalculateUtil.calculate(
          this.map.value.get(dashboard.id), this.auctionsService.mapped.value);

        return;
      }
    }
  }

  saveAll(boards: DashboardV2[], calculatePrice: boolean = true): void {
    boards.forEach(board => this.save(board, calculatePrice));
  }

  save(board: DashboardV2, calculatePrice: boolean = true): void {
    if (!board.id) {
      board.id = generateUUID();
      board.idIsBackendGenerated = false;
    }
    board.lastModified = +new Date();

    if (calculatePrice) {
      DashboardCalculateUtil.calculate(board, this.auctionsService.mapped.value);
    }

    if (!this.map.value.has(board.id)) {
      this.list.value.unshift(board);
      this.list.next([...this.list.value]);
    }
    this.map.value.set(board.id, board);
    this.db.addDashboards([{
      ...board,
      data: []
    }]);
    this.calculatedBoardEvent.emit(board.id);
  }

  delete(board: DashboardV2): void {
    const list = this.list.value.filter(b => b.id !== board.id);
    this.db.removeDashboard(board.id)
      .catch(error =>
        ErrorReport.sendError('DashboardService.delete', error));
    this.map.value.delete(board.id);
    this.list.next(list);
    this.calculatedBoardEvent.emit(board.id);
  }

  move(previousIndex: number, currentIndex: number) {
    const list: DashboardV2[] = [...this.list.value];
    const board: DashboardV2 = list[previousIndex];
    const targetBoard: DashboardV2 = list[currentIndex];

    try {
      if (previousIndex === undefined || currentIndex === undefined) {
        return;
      }
      board.sortOrder = currentIndex;
      targetBoard.sortOrder = previousIndex;

      moveItemInArray(list, previousIndex, currentIndex);

      list.forEach((dashboard, index) => {
        dashboard.sortOrder = index;
        this.save(dashboard, false);
      });
      this.list.next(list);
    } catch (error) {
      ErrorReport.sendError('DashboardService.move', error);
    }
  }
}
