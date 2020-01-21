import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {AuthService} from '../service/auth.service';
import {TextUtil} from '@ukon1990/js-utilities';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(private route: Router, private service: AuthService) {
  }

  intercept(r: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    const token = AuthService.authTokenEvent.value;
    if (token && !TextUtil.contains(r.url, '.s3.')) {
      return handler.handle(
        r.clone({
          headers: r.headers
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'application/json')
        }));
    }

    return handler.handle(r);
  }
}
