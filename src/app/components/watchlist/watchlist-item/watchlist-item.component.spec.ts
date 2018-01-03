import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistItemComponent } from './watchlist-item.component';
import { TestModule } from '../../../modules/test.module';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
