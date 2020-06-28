import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {TSM} from '../auction/models/tsm.model';
import {DatabaseService} from '../../services/database.service';
import {SharedService} from '../../services/shared.service';
import {AuctionHouseStatus} from '../auction/models/auction-house-status.model';
import {ErrorReport} from '../../utils/error-report.util';
import {MatSnackBar} from '@angular/material/snack-bar';
import {RealmService} from '../../services/realm.service';
import {environment} from '../../../environments/environment';
import {Platform} from '@angular/cdk/platform';
import {SubscriptionManager} from '@ukon1990/subscription-manager';

@Injectable({
  providedIn: 'root'
})
export class TsmService {
  static list: BehaviorSubject<TSM[]> = new BehaviorSubject<TSM[]>([]);
  static mapped: BehaviorSubject<Map<number, TSM>> = new BehaviorSubject(new Map<number, TSM>());

  private sm = new SubscriptionManager();

  constructor(private http: HttpClient,
              private db: DatabaseService,
              public platform: Platform,
              private snackBar: MatSnackBar,
              private realmService: RealmService) {
    this.sm.add(this.realmService.events.realmChanged, (evt) => {
      console.log('RealmStatus changed', evt);
    });
  }


  static getById(id: number): TSM {
    return this.mapped.value.get(id);
  }

  load(): Promise<TSM[]> {
    return new Promise<TSM[]>((resolve, reject) => {
      if (new Date().toDateString() !== localStorage['timestamp_tsm']) {
        this.get()
          .then(resolve)
          .catch(reject);
      } else {
        this.getFromDB()
          .then(data => {
            if (!data || !data.length) {
              this.get()
                .then(resolve)
                .catch(reject);
            } else {
              resolve();
            }
          })
          .catch((error) => {
            ErrorReport.sendError('TsmService.load', error);
            this.get()
              .then(resolve)
              .catch(reject);
          });
      }
    });
  }

  get(): Promise<TSM[]> {
    return new Promise<TSM[]>((resolve, reject) => {
      const realmStatus: AuctionHouseStatus = this.realmService.events.realmStatus.value;
      // Regions such as Taiwan and Korea is not supported by TSM. But they should not have a tsmUrl
      if (realmStatus && realmStatus.tsmUrl) {
        console.log('Downloading TSM data');
        this.openSnackbar('Downloading TSM data');
        SharedService.downloading.tsmAuctions = true;
        this.http.get(realmStatus.tsmUrl)
          .toPromise()
          .then(tsm => {
            localStorage['timestamp_tsm'] = new Date().toDateString();
            SharedService.downloading.tsmAuctions = false;
            console.log('TSM data download is complete');
            this.processData(tsm as TSM[]);
            this.addToDB(tsm as TSM[]);
            this.openSnackbar('Completed TSM download');
            resolve();
          })
          .catch(error => {
            this.openSnackbar(
              `Something went wrong, while downloading TSM data.`);
            ErrorReport.sendError('TsmService.get', error);
            SharedService.downloading.tsmAuctions = false;
            resolve();
          });
      } else {
        resolve();
      }
    });
  }


  private addToDB(tsm: Array<TSM>): void {
    if (environment.test || this.platform === null || this.platform.WEBKIT || this.db.unsupported) {
      return;
    }
    this.db.db.table('tsm').clear()
      .then(() => {
        this.db.db.table('tsm')
          .bulkPut(tsm)
          .then(() =>
            console.log('Successfully added tsm data to local DB'))
          .catch(e =>
            ErrorReport.sendError('TsmService.addToDB', e));
      })
      .catch(error =>
        ErrorReport.sendError('TsmService.addToDB', error));
  }

  private getFromDB(): Promise<TSM[]> {
    return new Promise<TSM[]>((resolve, reject) => {
      if (this.platform === null || this.platform.WEBKIT || this.db.unsupported) {
        reject([]);
      } else {
        SharedService.downloading.tsmAuctions = true;
        return this.db.db.table('tsm')
          .toArray()
          .then(tsm => {
            this.processData(tsm);
            SharedService.downloading.tsmAuctions = false;
            console.log('Restored TSM data from local DB');
            resolve(tsm);
          })
          .catch(e => {
            ErrorReport.sendError('TsmService.getFromDB', e);
            SharedService.downloading.tsmAuctions = false;
            reject(e);
          });
      }
    });
  }

  private openSnackbar(message: string): void {
    this.snackBar.open(message, 'Ok', {duration: 3000});
  }

  private processData(tsm: TSM[]) {
    const map = new Map<number, TSM>();
    tsm.forEach(a => {
      map.set(a.Id, a);
    });
    TsmService.mapped.next(map);
    TsmService.list.next(tsm);
  }
}
