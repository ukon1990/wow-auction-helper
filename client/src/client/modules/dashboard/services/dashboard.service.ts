import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DashboardV2} from '../models/dashboard-v2.model';
import {ConditionEnum} from '../types/condition.enum';
import {TargetValueEnum} from '../types/target-value.enum';
import {DashboardCalculateUtil} from '../utils/dashboard-calculate.util';
import {AuctionsService} from '../../../services/auctions.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {AuctionItem} from '../../auction/models/auction-item.model';
import {defaultBoards} from '../data/default-doards.data';
import {ErrorReport} from '../../../utils/error-report.util';
import generateUUID from '../../../utils/uuid.util';
import {SharedService} from "../../../services/shared.service";
import {ArrayUtil, ObjectUtil} from "@ukon1990/js-utilities";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    calculatedBoardEvent: EventEmitter<string> = new EventEmitter<string>();
    list: BehaviorSubject<DashboardV2[]> = new BehaviorSubject<DashboardV2[]>([]);
    map: BehaviorSubject<Map<string, DashboardV2>> = new BehaviorSubject<Map<string, DashboardV2>>(new Map<string, DashboardV2>());

    private sm = new SubscriptionManager();
    private STORAGE_NAME = 'dashboards';

    constructor(private auctionsService: AuctionsService) {
        this.init();
        this.sm.add(this.auctionsService.mapped,
            (map) => this.calculateAll(map));
    }

    init(): void {
        this.restore();
        this.migrate();
        this.calculateAll();
    }

    calculateAll(map: Map<string, AuctionItem> = this.auctionsService.mapped.value): void {
        DashboardCalculateUtil.setItemSources(map);
        this.list.value.forEach(board => {
            DashboardCalculateUtil.calculate(board, map);
            this.map.value.set(board.id, board);
            this.calculatedBoardEvent.emit(board.id);
        });
    }

    private restore(): void {
        const storedItem = localStorage.getItem(this.STORAGE_NAME);
        let dashboards = defaultBoards;
        if (storedItem) {
            try {
                dashboards = JSON.parse(storedItem) as DashboardV2[];
            } catch (e) {
                ErrorReport.sendError('DashboardService.restore', e);
            }
        }

        this.list.next(
            dashboards.sort((a, b) =>
                a.sortOrder - b.sortOrder));
        this.list.value.forEach(board =>
            this.map.value.set(board.id, board));
    }

    save(board: DashboardV2): void {
        if (!board.id) {
            board.id = generateUUID();
            board.idIsBackendGenerated = false;
        }
        board.lastModified = +new Date();

        if (!this.map.value.has(board.id)) {
            this.list.value.push(board);
        }
        this.map.value.set(board.id, board);
        const copyList = this.list.value.map(entry => {
            const copy = ObjectUtil.clone(entry) as DashboardV2;
            copy.data = [];
        });
        localStorage.setItem(this.STORAGE_NAME, JSON.stringify(copyList));
        this.calculatedBoardEvent.emit(board.id);
    }

    private migrate(): void {
        const storageName = 'watchlist';
        // const oldList = SharedService.user.watchlist.

        // localStorage.removeItem(storageName);
    }
}
