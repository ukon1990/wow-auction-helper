import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MarketResetComponent} from './market-reset.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../../material.module';
import {TableModule} from '../../../table/table.module';
import {UtilModule} from '../../../util/util.module';

describe('MarketResetComponent', () => {
  let component: MarketResetComponent;
  let fixture: ComponentFixture<MarketResetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketResetComponent ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MaterialModule,
        TableModule,
        UtilModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
