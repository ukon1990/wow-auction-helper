import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AucScanDataImportComponent } from './auc-scan-data-import.component';

describe('AucScanDataImportComponent', () => {
  let component: AucScanDataImportComponent;
  let fixture: ComponentFixture<AucScanDataImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AucScanDataImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AucScanDataImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
