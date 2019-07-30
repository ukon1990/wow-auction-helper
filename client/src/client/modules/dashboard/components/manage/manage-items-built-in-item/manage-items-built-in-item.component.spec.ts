import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ManageItemsBuiltInItemComponent} from './manage-items-built-in-item.component';
import {MockLoaderUtil} from '../../../../../mocks/mock-loader.util';

describe('ManageItemsBuiltInItemComponent', () => {
  let component: ManageItemsBuiltInItemComponent;
  let fixture: ComponentFixture<ManageItemsBuiltInItemComponent>;

  beforeAll(() => {
    new MockLoaderUtil().initBaseData();
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageItemsBuiltInItemComponent]
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
