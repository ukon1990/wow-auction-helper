import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TestModule } from '../../../modules/test.module';
import { AboutWhatIsComponent } from './about-what-is.component';

describe('AboutWhatIsComponent', () => {
  let component: AboutWhatIsComponent;
  let fixture: ComponentFixture<AboutWhatIsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
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
