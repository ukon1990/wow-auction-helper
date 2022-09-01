import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalStatus, SQLProcess, TableSize} from "@shared/models";
import {Endpoints} from "../../../services/endpoints";

@Injectable()
export class AdminService {

  constructor(private http: HttpClient) {
  }

  getCurrentQueries(): Promise<SQLProcess[]> {
    return this.http.get(Endpoints.getLambdaUrl('logger/queries')).toPromise() as Promise<SQLProcess[]>;
  }

  getTableSize(): Promise<TableSize[]> {
    return this.http.get(Endpoints.getLambdaUrl('logger/tables')).toPromise() as Promise<TableSize[]>;
  }

  getGlobalStatus(): Promise<GlobalStatus> {
    return this.http.get(Endpoints.getLambdaUrl('logger/global-status')).toPromise() as Promise<GlobalStatus>;
  }
}