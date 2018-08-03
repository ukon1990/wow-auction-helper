import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisenchantingComponent } from './disenchanting.component';

describe('DisenchantingComponent', () => {
  let component: DisenchantingComponent;
  let fixture: ComponentFixture<DisenchantingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisenchantingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisenchantingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
