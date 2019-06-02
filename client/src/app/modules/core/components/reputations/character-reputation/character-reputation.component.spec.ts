import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterReputationComponent } from './character-reputation.component';

describe('CharacterReputationComponent', () => {
  let component: CharacterReputationComponent;
  let fixture: ComponentFixture<CharacterReputationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharacterReputationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharacterReputationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
