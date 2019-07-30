import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealmListComponent } from './realm-list.component';

describe('RealmListComponent', () => {
  let component: RealmListComponent;
  let fixture: ComponentFixture<RealmListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealmListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealmListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
