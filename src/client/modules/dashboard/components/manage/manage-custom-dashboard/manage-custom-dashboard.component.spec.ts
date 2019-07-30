import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCustomDashboardComponent } from './manage-custom-dashboard.component';

describe('ManageCustomDashboardComponent', () => {
  let component: ManageCustomDashboardComponent;
  let fixture: ComponentFixture<ManageCustomDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageCustomDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCustomDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
