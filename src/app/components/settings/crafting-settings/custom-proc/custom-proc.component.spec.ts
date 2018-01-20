import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomProcComponent } from './custom-proc.component';

describe('CustomProcComponent', () => {
  let component: CustomProcComponent;
  let fixture: ComponentFixture<CustomProcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomProcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomProcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
