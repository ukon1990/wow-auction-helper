import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Dashboard} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  static list: BehaviorSubject<Dashboard[]> = new BehaviorSubject<Dashboard[]>([]);
  static map: BehaviorSubject<Map<string, Dashboard>> = new BehaviorSubject<Map<string, Dashboard>>(new Map<string, Dashboard>());

  constructor() {
    this.init();
  }

  init(): void {
  }

  save(): void {
  }

  saveAll(): void {
  }
}
