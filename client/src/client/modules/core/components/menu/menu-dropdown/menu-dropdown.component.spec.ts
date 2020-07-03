import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuDropdownComponent } from './menu-dropdown.component';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import {RouterTestingModule} from '@angular/router/testing';

describe('MenuDropdownComponent', () => {
  let component: MenuDropdownComponent;
  let fixture: ComponentFixture<MenuDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuDropdownComponent ],
      imports: [
        MatMenuModule,
        MatButtonModule,
        MatGridListModule,
        RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
