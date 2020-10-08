import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealmListDialogComponent } from './realm-list-dialog.component';

describe('RealmListDialogComponent', () => {
  let component: RealmListDialogComponent;
  let fixture: ComponentFixture<RealmListDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealmListDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealmListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
