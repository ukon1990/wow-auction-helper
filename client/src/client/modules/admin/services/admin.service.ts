import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {APIRecipe, GlobalStatus, SQLProcess, TableSize} from '@shared/models';
import {Endpoints} from '../../../services/endpoints';
import {firstValueFrom} from 'rxjs';
import {AuctionHouseStatus} from '../../auction/models/auction-house-status.model';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable()
export class AdminService {

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
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

  getAllRecipes(): Promise<{recipes: APIRecipe[]}> {
    return firstValueFrom(this.http.get(
      Endpoints.getLambdaUrl(`admin/recipes`)
    )) as Promise<{recipes: APIRecipe[]}>;
  }

  updateItemFromAPI(id: number): Promise<any> {
    return firstValueFrom(this.http.get(
      Endpoints.getLambdaUrl('admin/items/update/' + id)
    )) as Promise<any>;
  }
  updateRecipe(recipe: APIRecipe): Promise<APIRecipe> {
    return firstValueFrom(this.http.patch(
      Endpoints.getLambdaUrl(`admin/recipes`),
      recipe
    )) as Promise<APIRecipe>;
  }

  updateRecipeJSONFilesRetail(): Promise<any> {
    return firstValueFrom(
      this.http.get(Endpoints.getLambdaUrl('admin/recipes/update-json'))) as Promise<any>;
  }

  updateRecipes(isClassic): Promise<any> {
    return firstValueFrom(this.http.post(
      Endpoints.getLambdaUrl(`admin/recipes/update-all`),
      {isClassic}
    ));
  }

  getCompareRecipeAPI(id: number): Promise<any> {
    return firstValueFrom(this.http.get(
      Endpoints.getLambdaUrl(`admin/recipes/${id}`)));
  }

  updateOnUseRecipes(): Promise<any> {
    return firstValueFrom(this.http.get(
      Endpoints.getLambdaUrl(`admin/recipes/update-on-use`)
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

  updateHouse(house: AuctionHouseStatus) {
    firstValueFrom(this.http.post(
      Endpoints.getLambdaUrl(`admin/auction-house/realm/update`), house))
      .then(() => {
        this.snackBar.open(`Successfully updated ${house.id}`, 'Ok');
      })
      .catch((error) => {
        this.snackBar.open(`Failed with updating ${house.id} - ${error?.message}`, 'Ok');
      });
  }

  updateHouseStats(house: AuctionHouseStatus) {
    firstValueFrom(this.http.post(
      Endpoints.getLambdaUrl(`admin/auction-house/realm/stats/update`), house))
      .then(() => {
        this.snackBar.open(`Successfully updated ${house.id}`, 'Ok');
      })
      .catch((error) => {
        this.snackBar.open(`Failed with updating ${house.id} - ${error?.message}`, 'Ok');
      });
  }
}