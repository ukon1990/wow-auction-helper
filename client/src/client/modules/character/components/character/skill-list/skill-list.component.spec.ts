import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillListComponent } from './skill-list.component';

describe('SkillListComponent', () => {
  let component: SkillListComponent;
  let fixture: ComponentFixture<SkillListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
