import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardItemComponent } from './dashboard-item.component';
import {TestModule} from '../../../test.module';
import {Dashboard} from '../../models/dashboard.model';
import {defaultBoards} from '../../data/default-doards.data';

describe('DashboardItemComponent', () => {
  let component: DashboardItemComponent;
  let fixture: ComponentFixture<DashboardItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardItemComponent);
    component = fixture.componentInstance;
    component.dashboard = defaultBoards[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
