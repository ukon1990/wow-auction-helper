import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoldSummaryChartComponent } from './gold-summary-chart.component';

describe('GoldSummaryChartComponent', () => {
  let component: GoldSummaryChartComponent;
  let fixture: ComponentFixture<GoldSummaryChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoldSummaryChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoldSummaryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
