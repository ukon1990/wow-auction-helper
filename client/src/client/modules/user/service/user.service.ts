import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SharedService} from '../../../services/shared.service';
import {Report} from '../../../utils/report.util';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  getUserInfo(): Promise<any> {
    const region: string = SharedService.user.region;
    return this.http.get(`https://${region}.battle.net/oauth/userinfo`)
      .toPromise()
      .then(user => {
        Report.debug('getUserInfo', user);
      })
      .catch(console.error);
  }

  getCharacters(): Promise<any> {
    return null;
  }

  save(): Promise<any> {
    return null;
  }

  get(): Promise<any> {
    return null;
  }
}
