import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResellHistoryComponent } from './resell-history.component';

describe('ResellHistoryComponent', () => {
  let component: ResellHistoryComponent;
  let fixture: ComponentFixture<ResellHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResellHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
