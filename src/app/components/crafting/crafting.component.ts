import { Component, OnInit } from '@angular/core';
import { Recipe } from '../../models/crafting/recipe';
import { SharedService } from '../../services/shared.service';
import { ColumnDescription } from '../../models/column-description';

@Component({
  selector: 'wah-crafting',
  templateUrl: './crafting.component.html',
  styleUrls: ['./crafting.component.scss']
})
export class CraftingComponent implements OnInit {

  columns: Array<ColumnDescription> = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'profession', title: 'Profession', dataType: ''},
    {key: 'cost', title: 'Cost', dataType: 'gold'},
    {key: 'roi', title: 'ROI', dataType: 'gold'},
    {key: '', title: 'Actions', dataType: 'action', actions: ['buy', 'wowhead', 'item-info']}
  ];

  constructor() { }

  ngOnInit() {
  }

  getRecipes(): Array<Recipe> {
    return SharedService.recipes;
  }

}
