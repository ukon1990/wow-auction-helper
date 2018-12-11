import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SharedService } from './services/shared.service';

@Injectable()
export class IsRegisteredService implements CanActivate {

  constructor(private _ruter: Router) { }

  canActivate(): boolean {
    if (SharedService.user.realm && SharedService.user.region) {
      return true;
    }
    this._ruter.navigateByUrl('');
    return false;
  }
}
