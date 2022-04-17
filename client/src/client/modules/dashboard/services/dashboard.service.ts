import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Dashboard} from '@shared/models';
import {DashboardCalculateUtil} from '../utils/dashboard-calculate.util';
import {AuctionsService} from '../../../services/auctions.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {getDefaultDashboards} from '../data/default-doards.data';
import {ErrorReport} from '../../../utils/error-report.util';
import generateUUID from '../../../utils/uuid.util';
import {ObjectUtil, TextUtil} from '@ukon1990/js-utilities';
import {DatabaseService} from '../../../services/database.service';
import {Report} from '../../../utils/report.util';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {ProfessionService} from '../../crafting/services/profession.service';
import {CraftingUtil} from '../../crafting/utils/crafting.util';
import {BackgroundDownloadService} from '../../core/services/background-download.service';
import {AuthService} from '../../user/services/auth.service';
import {Endpoints} from '../../../services/endpoints';
import {HttpClient} from '@angular/common/http';
import {SettingsService} from '../../user/services/settings/settings.service';
import {DashboardAppsyncUtil} from '../utils/dashboard-appsync.util';
import {DashboardMinimal} from "@shared/models";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  calculatedBoardEvent: EventEmitter<string> = new EventEmitter<string>();
  allBoardsCalculatedEvent: BehaviorSubject<number | boolean> = new BehaviorSubject<number | boolean>(false);
  list: BehaviorSubject<Dashboard[]> = new BehaviorSubject<Dashboard[]>([]);
  map: BehaviorSubject<Map<string, Dashboard>> = new BehaviorSubject<Map<string, Dashboard>>(new Map<string, Dashboard>());
  defaultMap: BehaviorSubject<Map<string, Dashboard>> = new BehaviorSubject<Map<string, Dashboard>>(new Map<string, Dashboard>());

  private sm = new SubscriptionManager();
  private isInitiated: boolean;
  private lastUpdateRequest: number;

  constructor(
    private auctionsService: AuctionsService,
    private db: DatabaseService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private http: HttpClient,
    private professionService: ProfessionService,
    private backgroundService: BackgroundDownloadService
  ) {
    // this.sm.add(authService.isAuthenticated, isAuthenticated => this.getDashboardsFromAPI(isAuthenticated));
    this.sm.add(this.professionService.listWithRecipes, (list) => {
      this.sm.unsubscribeById('auctions');

      if (list.length) {
        this.init()
          .catch(error => ErrorReport.sendError('DashboardService.init', error));

        this.sm.add(this.auctionsService.mapped,
          (map) => {
            this.calculateAll(map);
          },
          {
            id: 'auctions'
          });
      }
    });

    this.sm.add(this.backgroundService.isInitialLoadCompleted, isInitialLoadCompleted => {
      if (isInitialLoadCompleted) {
        this.calculateAll(undefined, isInitialLoadCompleted);
        this.sm.unsubscribeById('isInitialLoadCompleted');
      }
    }, {id: 'isInitialLoadCompleted'});

    this.sm.add(settingsService.dashboards,
      boards => this.saveAll(boards, true, false));

    /*
    this.sm.add(TsmService.list, () => {
      if (this.isInitiated && this.backgroundService.isInitialLoadCompleted.value) {
        this.calculateAll();
      }
    });
    */
  }

  async init(): Promise<void> {
    await this.restore();
    this.calculateAll();
    this.isInitiated = true;
  }

  calculateAll(
    map: Map<string, AuctionItem> = this.auctionsService.mapped.value,
    isInitialLoadCompleted: boolean = this.backgroundService.isInitialLoadCompleted.value,
  ): void {
    if (map.size > 0 && isInitialLoadCompleted) {
      CraftingUtil.calculateCost(false, map);
      this.list.value.forEach(board => {
        DashboardCalculateUtil.calculate(board, map);
        this.map.value.set(board.id, board);
        this.calculatedBoardEvent.emit(board.id);
      });
      Report.debug('Boards', this.list.value);
      this.allBoardsCalculatedEvent.next(+new Date());
    }
  }

  getAllPublic(): Promise<DashboardMinimal[]> {
    return new Promise<DashboardMinimal[]>((resolve, reject) => {
      this.http.get(Endpoints.getLambdaUrl('dashboard'))
        .toPromise()
        .then((res: DashboardMinimal[]) => resolve(res))
        .catch(reject);
    });
  }

  getCopyById(id: string): Promise<Dashboard> {
    return this.http.get(Endpoints.getLambdaUrl('dashboard/copy/' + id))
      .toPromise() as Promise<Dashboard>;
  }

  importPublicBoard(id: string, existing: Dashboard): Promise<void> {
    return new Promise((resolve) => {
      this.getCopyById(id)
        .then((board: Dashboard) => {
          this.save({
            ...board,
            id: existing ? existing.id : board.id
          })
            .catch(console.error);
          resolve();
        })
        .catch(error => {
          ErrorReport.sendError('DashboardService.importPublicBoard', error);
          resolve();
        });
    });
  }

  saveToPublicDataset(board: Dashboard): Promise<Dashboard> {
    return new Promise<Dashboard>((resolve, reject) => {
      this.http.post(Endpoints.getLambdaUrl('dashboard'), {
        ...board,
        isDisabled: false // In case the user has a disabled board that they are updating which also is public
      })
        .toPromise()
        .then((res: Dashboard) => {
          if (res.id) {
            res.isDisabled = board.isDisabled;
            this.save(res)
              .catch(console.error);
            resolve(res);
          } else {
            Report.debug('saveToPublicDataset with no id', res);
          }
        })
        .catch(reject);
    });
  }

  deletePublicEntry(board: Dashboard, deleteLocal = false): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.delete(Endpoints.getLambdaUrl('dashboard/' + board.id))
        .toPromise()
        .then((res) => {
          Report.debug('Delete dashboard response', res);
          if (deleteLocal) {
            this.delete(board);
          } else {
            board.isPublic = false;
            this.save(board)
              .catch(console.error);
          }
          resolve();
        })
        .catch(reject);
    });
  }

  /*
  getDashboardsFromAPI(isAuthenticated: boolean): void {
    console.log('Is authenticated?', isAuthenticated);
    if (isAuthenticated) {
      this.http.get(Endpoints.getLambdaUrl('dashboard'))
        .toPromise()
        .then(res => console.log('DB res', res))
        .catch(console.error);
    }
  }
  */

  private async restore(): Promise<void> {
    const defaultBoards = getDefaultDashboards(this.professionService.listWithRecipes.value);
    const dashboards: Dashboard[] = [];
    const restoredMap: Map<string, Dashboard> = new Map();
    const defaultMap: Map<string, Dashboard> = new Map();
    const restoredDefaultMap: Map<string, Dashboard> = new Map();
    const fromOnlineStorage: Dashboard[] = this.settingsService.dashboards.value;

    const handleModifiedBoards = (boards: Dashboard[]) => {
      boards.forEach(board => {
        dashboards.push(board);
        restoredMap.set(board.id, board);
        if (board.isDefault) {
          restoredDefaultMap.set(board.parentId, board);
        }
      });
    };

    if (fromOnlineStorage && fromOnlineStorage.length) {
      handleModifiedBoards(fromOnlineStorage);
    } else {
      await this.db.getDashboards()
        .then(restored => {
          handleModifiedBoards(restored);
        })
        .catch(error =>
          ErrorReport.sendError('DashboardService.restore', error));
    }

    defaultBoards.forEach(board => {
      defaultMap.set(board.id, board);
      const parent = restoredMap.get(board.parentId);
      if (!restoredMap.has(board.id)) {
        dashboards.push(ObjectUtil.clone(board) as Dashboard);
      }
    });

    this.defaultMap.next(defaultMap);
    this.list.next(
      dashboards.sort((a, b) =>
        a.sortOrder - b.sortOrder));
    this.list.value.forEach(board =>
      this.map.value.set(board.id, board));
  }


  reset(dashboard: Dashboard): void {
    const defaultBoards = getDefaultDashboards(this.professionService.list.value);
    for (let i = 0; i < defaultBoards.length; i++) {
      if (dashboard.id === defaultBoards[i].id) {
        this.map.value.set(dashboard.id, defaultBoards[i]);
        const list: Dashboard[] = [];
        this.map.value.forEach(board => list.push(board));
        this.list.next(list);
        DashboardCalculateUtil.calculate(
          this.map.value.get(dashboard.id), this.auctionsService.mapped.value);

        return;
      }
    }
  }

  saveAll(boards: Dashboard[], calculatePrice: boolean = true, saveToAppSync = true): void {
    boards.forEach(board => this.save(board, calculatePrice, false));

    if (saveToAppSync) {
      this.saveToAppSync();
    }
  }

  async save(board: Dashboard, calculatePrice: boolean = true, saveToAppSync = true): Promise<void> {
    if (!board.id) {
      board.id = generateUUID();
      board.idIsBackendGenerated = false;
    }
    if (TextUtil.contains(board.id, 'default')) {
      board.isDefault = true;
      board.parentId = board.id;
      board.idIsBackendGenerated = false;
    }

    if (board.isPublic === undefined) {
      board.isPublic = false;
    }

    if (!board.createdBy && this.authService.isAuthenticated.value && !board.isDefault) {
      board.createdBy = this.authService.user.value.getUsername();
    }

    if (calculatePrice) {
      DashboardCalculateUtil.calculate(board, this.auctionsService.mapped.value);
    }

    if (!this.map.value.has(board.id)) {
      this.list.value.unshift(board);
      this.list.next([...this.list.value]);
    } else {
      this.list.next(this.list.value.map(b => b.id === board.id ? board : b));
    }

    this.map.value.set(board.id, board);
    Object.assign(this.map.value.get(board.id), board);
    await this.db.addDashboards([{
      ...board,
      data: []
    }]);
    this.calculatedBoardEvent.emit(board.id);

    // Should not save, if we are restoring from appSync
    if (saveToAppSync) {
      this.saveToAppSync(0);
    }
  }

  delete(board: Dashboard): void {
    const list = this.list.value.filter(b => b.id !== board.id);
    this.db.removeDashboard(board.id)
      .catch(error =>
        ErrorReport.sendError('DashboardService.delete', error));
    this.map.value.delete(board.id);
    this.list.next(list);
    this.calculatedBoardEvent.emit(board.id);

    this.saveToAppSync();
  }

  move(previousIndex: number, currentIndex: number) {
    const list: Dashboard[] = [...this.list.value];
    const board: Dashboard = list[previousIndex];
    const targetBoard: Dashboard = list[currentIndex];

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

  private saveToAppSync(delay = 2500) {
    this.lastUpdateRequest = +new Date();

    setTimeout(() => {
      const timeDiff = +new Date() - this.lastUpdateRequest;
      if (timeDiff >= delay && this.lastUpdateRequest) {
        this.lastUpdateRequest = undefined;
        Report.debug('saveToAppSync', DashboardAppsyncUtil.reduce(this.list.value));
        this.settingsService.updateSettings({
          dashboards: DashboardAppsyncUtil.reduce(this.list.value)
        });
      }
    }, delay);
  }
}