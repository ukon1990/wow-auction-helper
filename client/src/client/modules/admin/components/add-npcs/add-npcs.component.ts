import {Component, OnDestroy, OnInit} from '@angular/core';
import {NpcService} from '../../../npc/services/npc.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {SharedService} from '../../../../services/shared.service';
import {ItemExtract} from '../../../../utils/item-extract.util';
import {FormControl, FormGroup} from '@angular/forms';
import {ColumnDescription} from '../../../table/models/column-description';

@Component({
  selector: 'wah-add-npcs',
  templateUrl: './add-npcs.component.html',
  styleUrls: ['./add-npcs.component.scss']
})
export class AddNpcsComponent implements OnInit, OnDestroy {
  list = [];
  npcBatchedIds = [];
  batchSize = 100;
  sm = new SubscriptionManager();
  storageName = 'admin-add-npcs-map';
  addedNpcs = [];
  form: FormGroup = new FormGroup({
    index: new FormControl(0)
  });
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'name'},
    {key: 'tag', title: 'Tag', dataType: 'string'},
    {key: 'sellsCount', title: 'Sell #', dataType: 'number'},
    {key: 'dropsCount', title: 'Drop #', dataType: 'number'}
  ];

  constructor(private service: NpcService) {
    this.sm.add(SharedService.events.items, () => {
      this.list = ItemExtract.fromItems(SharedService.itemsUnmapped);
      this.npcBatchedIds = [];
      for (let i = 0; i < this.list.length; i++) {
        const batchIndex = Math.ceil(i / this.batchSize) - 1;
        if (!this.npcBatchedIds[batchIndex]) {
          this.npcBatchedIds[batchIndex] = [];
        }
        this.npcBatchedIds[batchIndex].push(this.list[i].id);
      }

      console.log('NPC id batches', this.npcBatchedIds);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  addNpcs() {
    this.service.getIds(this.npcBatchedIds[this.form.value.index])
      .then((response: any[]) => {
        console.log(response);
        this.addedNpcs = [...this.addedNpcs, response.map(npc => ({
          name: npc.name.en_GB,
          tag: npc.tag.en_GB,
          sellCount: npc.sells.length,
          dropCount: npc.drops.length
        }))];
      })
      .catch(console.error);
  }
}
