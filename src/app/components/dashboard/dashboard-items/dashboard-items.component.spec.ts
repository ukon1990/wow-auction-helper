import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardItemsComponent } from './dashboard-items.component';

describe('DasboardItemsComponent', () => {
  let component: DashboardItemsComponent;
  let fixture: ComponentFixture<DashboardItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
