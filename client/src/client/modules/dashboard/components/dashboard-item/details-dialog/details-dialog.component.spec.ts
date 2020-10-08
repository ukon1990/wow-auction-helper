import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDialogComponent } from './details-dialog.component';

describe('DetailsDialogComponent', () => {
  let component: DetailsDialogComponent;
  let fixture: ComponentFixture<DetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
