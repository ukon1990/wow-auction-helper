import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AhSummaryComponent } from './ah-summary.component';

describe('AhSummaryComponent', () => {
  let component: AhSummaryComponent;
  let fixture: ComponentFixture<AhSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AhSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AhSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
