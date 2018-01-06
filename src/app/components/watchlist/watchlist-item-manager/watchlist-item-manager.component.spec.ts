import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistItemManagerComponent } from './watchlist-item-manager.component';

describe('WatchlistItemManagerComponent', () => {
  let component: WatchlistItemManagerComponent;
  let fixture: ComponentFixture<WatchlistItemManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WatchlistItemManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchlistItemManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
