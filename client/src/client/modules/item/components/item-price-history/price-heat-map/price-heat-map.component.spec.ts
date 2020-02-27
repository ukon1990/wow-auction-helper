import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceHeatMapComponent } from './price-heatmap.component';

describe('PriceHeatmapComponent', () => {
  let component: PriceHeatMapComponent;
  let fixture: ComponentFixture<PriceHeatMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceHeatMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceHeatMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
