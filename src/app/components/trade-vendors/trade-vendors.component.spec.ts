import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeVendorsComponent } from './trade-vendors.component';

describe('TradeVendorsComponent', () => {
  let component: TradeVendorsComponent;
  let fixture: ComponentFixture<TradeVendorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeVendorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeVendorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
