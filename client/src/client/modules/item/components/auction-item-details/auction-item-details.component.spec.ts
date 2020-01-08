import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionItemDetailsComponent } from './auction-item-details.component';

describe('AuctionItemDetailsComponent', () => {
  let component: AuctionItemDetailsComponent;
  let fixture: ComponentFixture<AuctionItemDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuctionItemDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuctionItemDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
