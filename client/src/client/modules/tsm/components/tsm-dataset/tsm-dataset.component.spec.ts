import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TsmDatasetComponent } from './tsm-dataset.component';

describe('TsmDatasetComponent', () => {
  let component: TsmDatasetComponent;
  let fixture: ComponentFixture<TsmDatasetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TsmDatasetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TsmDatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
