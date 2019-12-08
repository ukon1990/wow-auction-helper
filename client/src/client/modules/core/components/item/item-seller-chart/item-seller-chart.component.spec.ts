import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSellerChartComponent } from './item-seller-chart.component';

describe('ItemSellerChartComponent', () => {
  let component: ItemSellerChartComponent;
  let fixture: ComponentFixture<ItemSellerChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSellerChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSellerChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
