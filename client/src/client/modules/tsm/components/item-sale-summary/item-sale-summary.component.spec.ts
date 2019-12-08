import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSaleSummaryComponent } from './item-sale-summary.component';

describe('ItemSaleSummaryComponent', () => {
  let component: ItemSaleSummaryComponent;
  let fixture: ComponentFixture<ItemSaleSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSaleSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSaleSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
