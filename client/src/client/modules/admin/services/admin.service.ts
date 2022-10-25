import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GlobalStatus, SQLProcess, TableSize} from '@shared/models';
import {Endpoints} from '../../../services/endpoints';
import {firstValueFrom} from 'rxjs';
import {AuctionHouseStatus} from '../../auction/models/auction-house-status.model';

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
    return new Promise<any[]>((resolve, reject) => {
      firstValueFrom(this.http.get(Endpoints.getLambdaUrl(`admin/realm`)))
        .then((houses: AuctionHouseStatus[]) => resolve(houses.map(house => ({
          ...house,
          lastRequested: house.lastRequested || 1,
          lastModified: house.lastModified || 1,
          nextUpdate: house.nextUpdate || 1,
          gameBuild: house.gameBuild ? 'Classic' : 'Retail',
        }))))
        .catch(reject);
    });
  }

  updateMissingItemsAtAH(isClassic): Promise<any> {
    return firstValueFrom(this.http.post(
      Endpoints.getLambdaUrl(`admin/item/find-missing-items`),
      {isClassic}
    ));
  }

  updateRecipes(isClassic): Promise<any> {
    return firstValueFrom(this.http.post(
      Endpoints.getLambdaUrl(`admin/recipes/update-all`),
      {isClassic}
    ));
  }

  updateRealmStatuses(): Promise<any> {
    return firstValueFrom(this.http.get(
      Endpoints.getLambdaUrl(`admin/realm/statuses`)));
  }

  addMissingRealms(): Promise<any> {
    return firstValueFrom(this.http.get(
      Endpoints.getLambdaUrl(`admin/realm/add-missing-realms`)));
  }
}