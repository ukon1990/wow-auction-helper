import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPrivacyComponent } from './about-privacy.component';

describe('AboutPrivacyComponent', () => {
  let component: AboutPrivacyComponent;
  let fixture: ComponentFixture<AboutPrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutPrivacyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
