import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemRulesComponent } from './item-rules.component';

describe('ItemRulesComponent', () => {
  let component: ItemRulesComponent;
  let fixture: ComponentFixture<ItemRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
