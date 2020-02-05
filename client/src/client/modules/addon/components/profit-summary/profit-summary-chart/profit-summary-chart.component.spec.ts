import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitSummaryChartComponent } from './profit-summary-chart.component';

describe('ProfitSummaryChartComponent', () => {
  let component: ProfitSummaryChartComponent;
  let fixture: ComponentFixture<ProfitSummaryChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfitSummaryChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfitSummaryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
