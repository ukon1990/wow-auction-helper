import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageItemsBuiltInComponent } from './manage-items-built-in.component';

describe('ManageItemsBuiltInComponent', () => {
  let component: ManageItemsBuiltInComponent;
  let fixture: ComponentFixture<ManageItemsBuiltInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageItemsBuiltInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageItemsBuiltInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
