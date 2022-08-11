import { TestBed } from '@angular/core/testing';

import { AdminCanActivateGuard } from './admin-can-activate.guard';

describe('AdminCanActivateGuard', () => {
  let guard: AdminCanActivateGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdminCanActivateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
