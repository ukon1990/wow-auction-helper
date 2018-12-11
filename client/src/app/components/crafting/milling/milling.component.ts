import { Component, OnInit } from '@angular/core';
import { ProspectingAndMillingUtil } from '../../../utils/prospect-milling.util';
import { Remains, RemainsSource } from '../../../models/item/remains.model';
import { ColumnDescription } from '../../../models/column-description';
import { SharedService } from '../../../services/shared.service';


@Component({
  selector: 'wah-milling',
  templateUrl: './milling.component.html',
  styleUrls: ['./milling.component.scss']
})
export class MillingComponent implements OnInit {
  locale = localStorage['locale'].split('-')[0];
  columns: ColumnDescription[] = [
    { key: 'name', title: 'Name', dataType: 'name' },
    { key: 'cost', title: 'Cost', dataType: 'gold' },
    { key: 'value', title: 'Value', dataType: 'gold' },
    { key: 'count', title: 'Count', dataType: 'number' },
    { key: 'dropChance', title: 'Drop chance', dataType: 'percent' }
  ];
  types = ProspectingAndMillingUtil.TYPES;
  milling: Remains[] = [];
  prospecting: Remains[] = [];
  isEditing: boolean;
  isEditingType;
  editingType = {
    MILLING: 'MILLING',
    PROSPECTING: 'PROSPECTING'
  };

  constructor() {
  }

  ngOnInit() {
  }

  getProspects(): Remains[] {
    return ProspectingAndMillingUtil.prospecting;
  }

  getMills(): Remains[] {
    return ProspectingAndMillingUtil.mills;
  }

  openEditWindow(type: string): void {
    this.isEditing = true;
    this.isEditingType = type;
    console.log('type', type, this.isEditingType === this.editingType.MILLING);
  }

  closeEditWindow(): void {
    this.isEditing = false;
    this.isEditingType = undefined;
  }
}
