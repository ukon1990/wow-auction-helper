import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalStatus, SQLProcess, TableSize} from '@shared/models';
import {Endpoints} from '../../../services/endpoints';
import {firstValueFrom} from 'rxjs';

@Injectable()
export class AdminService {

  constructor(private http: HttpClient) {
  }

  getCurrentQueries(): Promise<SQLProcess[]> {
    return firstValueFrom(this.http.get(Endpoints.getLambdaUrl('admin/database/queries'))) as Promise<SQLProcess[]>;
  }

  getTableSize(): Promise<TableSize[]> {
    return firstValueFrom(this.http.get(Endpoints.getLambdaUrl('admin/database/tables'))) as Promise<TableSize[]>;
  }

  getGlobalStatus(): Promise<GlobalStatus> {
    return firstValueFrom(this.http.get(Endpoints.getLambdaUrl('admin/database/global-status'))) as Promise<GlobalStatus>;
  }

  getUsers(paginationToken?: string): Promise<any[]> {
    const queryParams = paginationToken ? `?paginationToken=${paginationToken}` : '';
    return firstValueFrom(this.http.get(Endpoints.getLambdaUrl(`admin/users` + queryParams))) as Promise<any[]>;
  }

  getAllHouses(): Promise<any[]> {
    return firstValueFrom(this.http.get(Endpoints.getLambdaUrl(`admin/realm`))) as Promise<any[]>;
  }
}