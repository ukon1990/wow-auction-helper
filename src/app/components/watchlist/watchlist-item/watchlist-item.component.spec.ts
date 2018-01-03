import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistItemComponent } from './watchlist-item.component';
import { TestModule } from '../../../modules/test.module';
import { WatchlistItem } from '../../../models/watchlist/watchlist';

describe('WatchlistItemComponent', () => {
  let component: WatchlistItemComponent;
  let fixture: ComponentFixture<WatchlistItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchlistItemComponent);
    component = fixture.componentInstance;
    component.item = new WatchlistItem();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
