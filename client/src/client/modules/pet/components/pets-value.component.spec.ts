import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TestModule } from '../../test.module';

import { PetsValueComponent } from './pets-value.component';

describe('MyPetsComponent', () => {
  let component: PetsValueComponent;
  let fixture: ComponentFixture<PetsValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PetsValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
