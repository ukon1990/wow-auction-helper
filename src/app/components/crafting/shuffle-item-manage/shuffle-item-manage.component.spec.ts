import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShuffleItemManageComponent } from './shuffle-item-manage.component';

describe('ShuffleItemManageComponent', () => {
  let component: ShuffleItemManageComponent;
  let fixture: ComponentFixture<ShuffleItemManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShuffleItemManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShuffleItemManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
