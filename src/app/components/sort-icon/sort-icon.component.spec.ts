import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SortIconComponent } from './sort-icon.component';

describe('SortIconComponent', () => {
  let component: SortIconComponent;
  let fixture: ComponentFixture<SortIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SortIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
