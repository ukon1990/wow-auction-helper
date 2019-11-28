import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReputationsComponent } from './reputations.component';

describe('ReputationsComponent', () => {
  let component: ReputationsComponent;
  let fixture: ComponentFixture<ReputationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReputationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReputationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
