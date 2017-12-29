import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetCalcComponent } from './reset-calc.component';

describe('ResetCalcComponent', () => {
  let component: ResetCalcComponent;
  let fixture: ComponentFixture<ResetCalcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetCalcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetCalcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
