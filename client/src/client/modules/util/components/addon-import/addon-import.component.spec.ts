import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddonImportComponent } from './addon-import.component';

describe('AddonImportComponent', () => {
  let component: AddonImportComponent;
  let fixture: ComponentFixture<AddonImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddonImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddonImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
