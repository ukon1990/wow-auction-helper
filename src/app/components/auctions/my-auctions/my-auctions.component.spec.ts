import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAuctionsComponent } from './my-auctions.component';
import { TestModule } from '../../../modules/test.module';

describe('MyAuctionsComponent', () => {
  let component: MyAuctionsComponent;
  let fixture: ComponentFixture<MyAuctionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAuctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
