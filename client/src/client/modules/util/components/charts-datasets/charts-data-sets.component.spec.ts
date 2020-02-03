import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {ChartsDataSetsComponent} from './charts-data-sets.component';


describe('ChartsDatasetsComponent', () => {
  let component: ChartsDataSetsComponent;
  let fixture: ComponentFixture<ChartsDataSetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartsDataSetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartsDataSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
