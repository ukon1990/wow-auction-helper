import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {AuthService} from './modules/user/services/auth.service';
import {TextUtil} from '@ukon1990/js-utilities';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(private route: Router, private service: AuthService) {
  }

  intercept(r: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.service.session.value ? this.service.session.value.getAccessToken().getJwtToken() : undefined;
    if (token &&
      TextUtil.contains(r.url, 'execute-api') ||
      TextUtil.contains(r.url, 'localhost') ||
      TextUtil.contains(r.url, 'appsync')
    ) {
      return handler.handle(
        r.clone({
          headers: r.headers
            .set('Authorization', `Bearer ${token}`)
        }));
    }

    return handler.handle(r);
  }
}
