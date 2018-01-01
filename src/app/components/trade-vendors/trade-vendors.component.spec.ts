import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeVendorsComponent } from './trade-vendors.component';
import { TestModule } from '../../modules/test.module';

describe('TradeVendorsComponent', () => {
  let component: TradeVendorsComponent;
  let fixture: ComponentFixture<TradeVendorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
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
