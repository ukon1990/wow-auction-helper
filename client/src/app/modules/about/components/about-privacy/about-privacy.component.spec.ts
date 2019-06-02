import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPrivacyComponent } from './about-privacy.component';
import { TestModule } from '../../../modules/test.module';

describe('AboutPrivacyComponent', () => {
  let component: AboutPrivacyComponent;
  let fixture: ComponentFixture<AboutPrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
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
