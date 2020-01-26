import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemPriceHistoryComponent } from './item-price-history.component';

describe('ItemPriceHistoryComponent', () => {
  let component: ItemPriceHistoryComponent;
  let fixture: ComponentFixture<ItemPriceHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemPriceHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemPriceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
