import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TsmTabComponent } from './tsm-tab.component';

describe('TsmTabComponent', () => {
  let component: TsmTabComponent;
  let fixture: ComponentFixture<TsmTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TsmTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TsmTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
