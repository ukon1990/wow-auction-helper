import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutDataComponent } from './about-data.component';
import { TestModule } from '../../../modules/test.module';

describe('AboutDataComponent', () => {
  let component: AboutDataComponent;
  let fixture: ComponentFixture<AboutDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
