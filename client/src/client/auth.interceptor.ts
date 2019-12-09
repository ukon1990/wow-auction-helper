import generateUUID from './utils/uuid.util';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {SharedService} from './services/shared.service';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(private route: Router) {
  }

  intercept(r: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    if (!SharedService.user.doNotReport) {
      let uuid = localStorage.getItem('uuid');
      if (!uuid) {
        uuid = generateUUID();
        localStorage.setItem('uuid', uuid);
      }
      return handler.handle(
        r.clone({
          headers: r.headers
          // .set('UUID', uuid)
          // .set('Authorization', `Bearer ${environment.token}`)
          // .set('Content-Type', 'application/json')
        }));
    }

    return handler.handle(r);
  }
}
