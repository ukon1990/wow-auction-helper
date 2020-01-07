import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoldByTabComponent } from './sold-by-tab.component';

describe('SoldByTabComponent', () => {
  let component: SoldByTabComponent;
  let fixture: ComponentFixture<SoldByTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoldByTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoldByTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
