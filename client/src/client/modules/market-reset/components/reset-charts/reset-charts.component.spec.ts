import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetChartsComponent } from './reset-charts.component';

describe('ResetChartsComponent', () => {
  let component: ResetChartsComponent;
  let fixture: ComponentFixture<ResetChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
