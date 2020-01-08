import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DroppedByTabComponent } from './dropped-by-tab.component';

describe('DroppedByTabComponent', () => {
  let component: DroppedByTabComponent;
  let fixture: ComponentFixture<DroppedByTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DroppedByTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DroppedByTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
