import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBoardsComponent } from './data-boards.component';

describe('DataBoardsComponent', () => {
  let component: DataBoardsComponent;
  let fixture: ComponentFixture<DataBoardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataBoardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataBoardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
