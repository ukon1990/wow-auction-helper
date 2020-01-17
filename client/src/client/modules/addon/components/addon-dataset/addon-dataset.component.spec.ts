import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddonDatasetComponent } from './addon-dataset.component';

describe('TsmDatasetComponent', () => {
  let component: AddonDatasetComponent;
  let fixture: ComponentFixture<AddonDatasetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddonDatasetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddonDatasetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
