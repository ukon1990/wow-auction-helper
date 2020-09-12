import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureComponent } from './configure.component';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

describe('ConfigureComponent', () => {
  let component: ConfigureComponent;
  let fixture: ComponentFixture<ConfigureComponent>;
  let loader: HarnessLoader;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureComponent ]
    })
    .compileComponents();
  }));

  // TODO: Check: https://stackoverflow.com/questions/55083747/angular-unit-testing-on-a-component-using-material-dialog-for-alerts-is-not-gett
  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
