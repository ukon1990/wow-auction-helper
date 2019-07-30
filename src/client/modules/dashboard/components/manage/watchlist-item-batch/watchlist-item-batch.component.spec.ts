import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistItemBatchComponent } from './watchlist-item-batch.component';

describe('WatchlistItemBatchComponent', () => {
  let component: WatchlistItemBatchComponent;
  let fixture: ComponentFixture<WatchlistItemBatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WatchlistItemBatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchlistItemBatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
