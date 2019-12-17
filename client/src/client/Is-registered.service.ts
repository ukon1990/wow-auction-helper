import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SharedService } from './services/shared.service';

@Injectable()
export class IsRegisteredService implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    if (SharedService.user.realm && SharedService.user.region) {
      return true;
    }
    if (this.router) {
      this.router.navigateByUrl('');
    }
    return false;
  }
}
