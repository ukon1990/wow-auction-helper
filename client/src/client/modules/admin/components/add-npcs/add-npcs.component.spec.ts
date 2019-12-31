import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNpcsComponent } from './add-npcs.component';

describe('AddNpcsComponent', () => {
  let component: AddNpcsComponent;
  let fixture: ComponentFixture<AddNpcsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNpcsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNpcsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
