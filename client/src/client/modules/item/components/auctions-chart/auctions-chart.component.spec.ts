import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionsChartComponent } from './auctions-chart.component';

describe('AuctionsChartComponent', () => {
  let component: AuctionsChartComponent;
  let fixture: ComponentFixture<AuctionsChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuctionsChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuctionsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
