import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProspectingComponent } from './prospecting.component';

describe('ProspectingComponent', () => {
  let component: ProspectingComponent;
  let fixture: ComponentFixture<ProspectingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProspectingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProspectingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
