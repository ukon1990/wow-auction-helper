import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SharedService } from './services/shared.service';

@Injectable()
export class IsRegisteredService implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    return !!(SharedService.user.realm && SharedService.user.region);
  }
}
