import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPriceCompareComponent } from './item-price-compare.component';

describe('ItemPriceCompareComponent', () => {
  let component: ItemPriceCompareComponent;
  let fixture: ComponentFixture<ItemPriceCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemPriceCompareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemPriceCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
