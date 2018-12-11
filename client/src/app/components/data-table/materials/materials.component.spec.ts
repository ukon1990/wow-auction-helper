import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialsComponent } from './materials.component';
import { TestModule } from '../../../modules/test.module';
import { SharedService } from '../../../services/shared.service';
import { AuctionItem } from '../../../models/auction/auction-item';
import { Recipe } from '../../../models/crafting/recipe';

describe('MaterialsComponent', () => {
  let component: MaterialsComponent;
  let fixture: ComponentFixture<MaterialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialsComponent);
    component = fixture.componentInstance;
    component.recipe = new Recipe();
    fixture.detectChanges();
  });

  describe('isEnoughAtAH', () => {
    it('With enough materials at AH', () => {
      SharedService.auctionItemsMap[25] = new AuctionItem();
      SharedService.auctionItemsMap[25].quantityTotal = 4;
      expect(component.isEnoughAtAH(25, 2)).toBeTruthy();
    });

    it('with too few materials at AH', () => {
      SharedService.auctionItemsMap[25] = new AuctionItem();
      SharedService.auctionItemsMap[25].quantityTotal = 4;
      expect(component.isEnoughAtAH(25, 16)).toBeFalsy();
    });
  });
});
