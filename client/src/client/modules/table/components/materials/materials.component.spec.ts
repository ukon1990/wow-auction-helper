import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialsComponent } from './materials.component';
import { TestModule } from '../../../test.module';
import { SharedService } from '../../../../services/shared.service';
import { AuctionItem } from '../../../auction/models/auction-item.model';
import { Recipe } from '../../../crafting/models/recipe';
import {AuctionsService} from '../../../../services/auctions.service';

describe('MaterialsComponent', () => {
  let component: MaterialsComponent;
  let fixture: ComponentFixture<MaterialsComponent>;
  let service: AuctionsService;

  beforeEach(() => {
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    })
    .compileComponents();
    service = TestBed.inject(AuctionsService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialsComponent);
    component = fixture.componentInstance;
    component.recipe = new Recipe();
    fixture.detectChanges();
  });

  describe('isEnoughAtAH', () => {
    it('With enough materials at AH', () => {
      const item = new AuctionItem();
      item.quantityTotal = 4;
      service.mapped.value.set('25', item);
      expect(component.isEnoughAtAH(25, 2)).toBeTruthy();
    });

    it('with too few materials at AH', () => {
      const item = new AuctionItem();
      item.quantityTotal = 4;
      service.mapped.value.set('25', item);
      expect(component.isEnoughAtAH(25, 16)).toBeFalsy();
    });
  });
});
