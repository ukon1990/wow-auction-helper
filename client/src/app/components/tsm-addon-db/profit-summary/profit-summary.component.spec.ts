import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitSummaryComponent } from './profit-summary.component';

describe('ProfitSummaryComponent', () => {
  let component: ProfitSummaryComponent;
  let fixture: ComponentFixture<ProfitSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfitSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfitSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
