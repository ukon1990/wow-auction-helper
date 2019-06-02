import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectRealmComponent } from './select-realm.component';

describe('SelectRealmComponent', () => {
  let component: SelectRealmComponent;
  let fixture: ComponentFixture<SelectRealmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectRealmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectRealmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
