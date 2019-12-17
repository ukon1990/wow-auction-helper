import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RealmQuickSelectComponent} from './realm-quick-select.component';

describe('CharacterSelectComponent', () => {
  let component: RealmQuickSelectComponent;
  let fixture: ComponentFixture<RealmQuickSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RealmQuickSelectComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealmQuickSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setRealmList', () => {
  });

  describe('handleRealmChange', () => {
  });

  describe('handleFactionChange', () => {
  });
});
