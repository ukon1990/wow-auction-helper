import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistItemManagerComponent } from './watchlist-item-manager.component';
import { TestModule } from '../../../../test.module';
import {WatchlistItem} from '../../../models/watchlist-item.model';

describe('WatchlistItemManagerComponent', () => {
  let component: WatchlistItemManagerComponent;
  let fixture: ComponentFixture<WatchlistItemManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchlistItemManagerComponent);
    component = fixture.componentInstance;
    component.item = new WatchlistItem();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
