import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TsmAddonDbComponent } from './tsm-addon-db.component';

describe('TsmAddonDbComponent', () => {
  let component: TsmAddonDbComponent;
  let fixture: ComponentFixture<TsmAddonDbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TsmAddonDbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TsmAddonDbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
