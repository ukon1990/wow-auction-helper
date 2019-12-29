import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MenuItemComponent} from './menu-item.component';
import {MenuItem} from '../../../../models/menu-item.model';
import {DebugElement} from '@angular/core';
import {CoreModule} from '../../../../core.module';
import {RouterTestingModule} from '@angular/router/testing';

describe('MenuItemComponent', () => {
  let component: MenuItemComponent;
  let fixture: ComponentFixture<MenuItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, RouterTestingModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuItemComponent);
    component = fixture.componentInstance;
    component.item = new MenuItem('The testing name', [], '');
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('html', () => {
    it('Should not display dropdown if no children, but also render text', () => {
      const debugElement: DebugElement = fixture.debugElement;
      const htmlElement: HTMLElement = debugElement.nativeElement;
      const button = htmlElement.querySelector('button');
      const dropdown = htmlElement.querySelectorAll('app-menu-dropdown button');

      expect(button.textContent).toContain('The testing name');
      expect(dropdown.length).toBeFalsy();
    });

    it('Should display dropdown if children are present, but also not render text', () => {

      component.item = new MenuItem('The testing name', [
        new MenuItem('1', [], '1'),
        new MenuItem('1', [], '1')
      ], '');
      fixture.detectChanges();

      const debugElement: DebugElement = fixture.debugElement;
      const htmlElement: HTMLElement = debugElement.nativeElement;
      const button = htmlElement.querySelector('app-menu-dropdown button');

      expect(button.textContent).toContain('The testing name');
    });
  });
});
