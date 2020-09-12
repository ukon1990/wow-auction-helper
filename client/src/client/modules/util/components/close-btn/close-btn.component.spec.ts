import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseBtnComponent } from './close-btn.component';

describe('CloseBtnComponent', () => {
  let component: CloseBtnComponent;
  let fixture: ComponentFixture<CloseBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseBtnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
