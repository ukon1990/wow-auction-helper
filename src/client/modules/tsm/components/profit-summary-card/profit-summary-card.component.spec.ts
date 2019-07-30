import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitSummaryCardComponent } from './profit-summary-card.component';

describe('ProfitSummaryCardComponent', () => {
  let component: ProfitSummaryCardComponent;
  let fixture: ComponentFixture<ProfitSummaryCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfitSummaryCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfitSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
