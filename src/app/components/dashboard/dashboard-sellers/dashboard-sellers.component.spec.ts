import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSellersComponent } from './dashboard-sellers.component';
import { TestModule } from '../../../modules/test.module';

describe('DashboardSellersComponent', () => {
  let component: DashboardSellersComponent;
  let fixture: ComponentFixture<DashboardSellersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
