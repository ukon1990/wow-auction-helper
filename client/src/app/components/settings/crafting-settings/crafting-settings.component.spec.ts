import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CraftingSettingsComponent } from './crafting-settings.component';
import { TestModule } from '../../../modules/test.module';

describe('CraftingSettingsComponent', () => {
  let component: CraftingSettingsComponent;
  let fixture: ComponentFixture<CraftingSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CraftingSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
