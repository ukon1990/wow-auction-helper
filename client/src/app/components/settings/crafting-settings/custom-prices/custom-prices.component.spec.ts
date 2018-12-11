import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPricesComponent } from './custom-prices.component';
import { TestModule } from '../../../../modules/test.module';

describe('CustomPricesComponent', () => {
  let component: CustomPricesComponent;
  let fixture: ComponentFixture<CustomPricesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
