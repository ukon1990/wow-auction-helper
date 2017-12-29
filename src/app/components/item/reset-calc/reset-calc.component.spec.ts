import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetCalcComponent } from './reset-calc.component';
import { TestModule } from '../../../modules/test.module';

describe('ResetCalcComponent', () => {
  let component: ResetCalcComponent;
  let fixture: ComponentFixture<ResetCalcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
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
