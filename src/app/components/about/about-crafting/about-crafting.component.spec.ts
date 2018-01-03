import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutCraftingComponent } from './about-crafting.component';
import { TestModule } from '../../../modules/test.module';

describe('CraftingComponent', () => {
  let component: AboutCraftingComponent;
  let fixture: ComponentFixture<AboutCraftingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutCraftingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
