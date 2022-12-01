import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControllerColumnComponent } from './form-controller-column.component';

describe('FormControllerColumnComponent', () => {
  let component: FormControllerColumnComponent;
  let fixture: ComponentFixture<FormControllerColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormControllerColumnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormControllerColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
