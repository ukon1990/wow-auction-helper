import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDetailComponent } from './vendor-detail.component';

describe('VendorDetailComponent', () => {
  let component: VendorDetailComponent;
  let fixture: ComponentFixture<VendorDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
