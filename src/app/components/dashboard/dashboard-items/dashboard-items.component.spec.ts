import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardItemsComponent } from './dashboard-items.component';
import { TestModule } from '../../../modules/test.module';

describe('DasboardItemsComponent', () => {
  let component: DashboardItemsComponent;
  let fixture: ComponentFixture<DashboardItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
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
