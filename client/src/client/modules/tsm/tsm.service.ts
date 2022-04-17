import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {TSM} from '@shared/models/auction/tsm.model';
import {DatabaseService} from '../../services/database.service';
import {SharedService} from '../../services/shared.service';
import {AuctionHouseStatus} from '../auction/models/auction-house-status.model';
import {ErrorReport} from '../../utils/error-report.util';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../environments/environment';
import {Platform} from '@angular/cdk/platform';

@Injectable({
  providedIn: 'root'
})
export class TsmService {
  static list: BehaviorSubject<TSM[]> = new BehaviorSubject<TSM[]>([]);
  static mapped: BehaviorSubject<Map<number, TSM>> = new BehaviorSubject(new Map<number, TSM>());
  private isDownloadingTSM = false;

  constructor(private http: HttpClient,
              private db: DatabaseService,
              public platform: Platform,
              private snackBar: MatSnackBar) {
  }


  static getById(id: number): TSM {
    return this.mapped.value.get(id);
  }

  /**
   * Deprecated
   * @param realmStatus
   */
  load(realmStatus: AuctionHouseStatus): Promise<TSM[]> {
    return new Promise<TSM[]>(async (resolve, reject) => {
      let list: TSM[] = [];
      let error;
      if (new Date().toDateString() !== localStorage['timestamp_tsm']) {
        await this.get(realmStatus)
          .then(data => list = data)
          .catch(err => error = err);
      }

      /* Temp deactivated to see if it affects loading speeds
      if (!list || !list.length) {
        await this.getFromDB()
          .then(data => list = data)
          .catch((err) => {
            ErrorReport.sendError('TsmService.load', error);
            error = err;
          });
      }
      */

      if (!list || !list.length) {
        await this.get(realmStatus)
          .then(data => list = data)
          .catch(err => error = err);
      } else {
        this.processData(list);
      }
      if (error) {
        reject(error);
      } else {
        resolve(list);
      }
    });
  }

  get(realmStatus: AuctionHouseStatus): Promise<TSM[]> {
    return new Promise<TSM[]>((resolve, reject) => {
      // Regions such as Taiwan and Korea is not supported by TSM. But they should not have a tsmUrl
      if (false) { // realmStatus && realmStatus.tsmUrl && !this.isDownloadingTSM
        console.log('Downloading TSM data');
        this.openSnackbar('Downloading TSM data');
        this.isDownloadingTSM = true;
        SharedService.downloading.tsmAuctions = true;
        this.http.get(realmStatus.tsmUrl)
          .toPromise()
          .then((tsm: TSM[]) => {
            localStorage.setItem('timestamp_tsm', new Date().toDateString());
            SharedService.downloading.tsmAuctions = false;
            this.isDownloadingTSM = false;
            console.log('TSM data download is complete');
            try {
              this.processData(tsm);
              /* Temp deactivated to see if it affects loading speeds
              this.addToDB(tsm);
               */
              this.openSnackbar('Completed TSM download');
            } catch (error) {
              ErrorReport.sendError('TsmService.get', error);
            }
            resolve(tsm || []);
          })
          .catch(error => {
            this.openSnackbar(
              `Something went wrong, while downloading TSM data.`);
            ErrorReport.sendError('TsmService.get', error);
            SharedService.downloading.tsmAuctions = false;
            this.isDownloadingTSM = false;
            resolve([]);
          });
      } else {
        resolve([]);
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