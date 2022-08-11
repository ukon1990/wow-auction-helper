import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../user/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminCanActivateGuard implements CanActivate {
  constructor(
    private authService: AuthService
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('can activate Is admin?', this.authService.isAdmin());
    return this.authService.isAdmin();
  }
}