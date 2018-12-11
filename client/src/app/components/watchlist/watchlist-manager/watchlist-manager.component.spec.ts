import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistManagerComponent } from './watchlist-manager.component';
import { TestModule } from '../../../modules/test.module';

describe('WatchlistManagerComponent', () => {
  let component: WatchlistManagerComponent;
  let fixture: ComponentFixture<WatchlistManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchlistManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
