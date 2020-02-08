import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {IssuesComponent} from './issues.component';
import {TestModule} from '../../../test.module';
import {GithubIssue} from '../../models/github/issues/github-issue.model';

describe('IssuesComponent', () => {
  let component: IssuesComponent;
  let fixture: ComponentFixture<IssuesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
