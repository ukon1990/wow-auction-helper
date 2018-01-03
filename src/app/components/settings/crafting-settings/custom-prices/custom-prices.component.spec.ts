import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPricesComponent } from './custom-prices.component';

describe('CustomPricesComponent', () => {
  let component: CustomPricesComponent;
  let fixture: ComponentFixture<CustomPricesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomPricesComponent ]
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
