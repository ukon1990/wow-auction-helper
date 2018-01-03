import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutWhatIsComponent } from './about-what-is.component';

describe('AboutWhatIsComponent', () => {
  let component: AboutWhatIsComponent;
  let fixture: ComponentFixture<AboutWhatIsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutWhatIsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutWhatIsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
