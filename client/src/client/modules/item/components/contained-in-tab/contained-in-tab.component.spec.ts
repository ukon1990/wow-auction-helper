import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainedInTabComponent } from './contained-in-tab.component';

describe('ContainedInTabComponent', () => {
  let component: ContainedInTabComponent;
  let fixture: ComponentFixture<ContainedInTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainedInTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainedInTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
