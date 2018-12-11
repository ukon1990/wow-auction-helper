import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageItemsBuiltInItemComponent } from './manage-items-built-in-item.component';

describe('ManageItemsBuiltInItemComponent', () => {
  let component: ManageItemsBuiltInItemComponent;
  let fixture: ComponentFixture<ManageItemsBuiltInItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageItemsBuiltInItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageItemsBuiltInItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
