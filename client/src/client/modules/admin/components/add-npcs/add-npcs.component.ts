import {Component, OnDestroy, OnInit} from '@angular/core';
import {NpcService} from '../../../npc/services/npc.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager/dist/subscription-manager';
import {SharedService} from '../../../../services/shared.service';
import {ItemExtract} from '../../../../utils/item-extract.util';
import {FormControl, FormGroup} from '@angular/forms';
import {ColumnDescription} from '../../../table/models/column-description';
import {GameBuild} from '../../../../utils/game-build.util';

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
    index: new FormControl()
  });
  columns: ColumnDescription[] = [
    {key: 'name', title: 'Name', dataType: 'string'},
    {key: 'tag', title: 'Tag', dataType: 'string'},
    {key: 'minLevel', title: 'Min level', dataType: 'number'},
    {key: 'maxLevel', title: 'Min level', dataType: 'number'},
    {key: 'sellCount', title: 'Sell #', dataType: 'number'},
    {key: 'dropCount', title: 'Drop #', dataType: 'number'},
    {key: 'expansion', title: 'Expansion', dataType: 'string'},
    {key: 'isAlliance', title: 'Alliance', dataType: 'boolean'},
    {key: 'isHorde', title: 'Horde', dataType: 'boolean'}
  ];

  constructor(private service: NpcService) {
    let previousIndex = 0;
    const fromStorage = localStorage.getItem(this.storageName);
    if (fromStorage) {
      previousIndex = +fromStorage;
    }
    this.form.controls.index.setValue(previousIndex);
    this.sm.add(SharedService.events.items, () => {
      this.list = ItemExtract.fromItems(SharedService.itemsUnmapped);
      this.groupIdsIntoBatches();
    });

    this.sm.add(this.form.controls.index.valueChanges, (index) => {
      localStorage.setItem(this.storageName, index);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  private groupIdsIntoBatches() {
    this.npcBatchedIds = [];
    for (let i = 0; i < this.list.length; i++) {
      const batchIndex = Math.ceil(i / this.batchSize) - 1;
      if (!this.npcBatchedIds[batchIndex]) {
        this.npcBatchedIds[batchIndex] = [];
      }
      this.npcBatchedIds[batchIndex].push(this.list[i].id);
    }

    console.log('NPC id batches', this.npcBatchedIds);
  }

  addNpcs() {
    const index = this.form.value.index;
    console.log('Starding on barch ', index);
    this.service.getIds(this.npcBatchedIds[index])
      .then((response: any[]) => {
        console.log(response);
        this.addedNpcs = [...response.map(npc => ({
          name: npc.name.en_GB,
          tag: npc.tag.en_GB,
          sellCount: npc.sells.length,
          dropCount: npc.drops.length,
          isAlliance: npc.isAlliance,
          isHorde: npc.isHorde,
          minLevel: npc.minLevel,
          maxLevel: npc.maxLevel,
          expansion: npc.expansionId ? GameBuild.expansionMap[npc.expansionId] : '-1'
        })), ...this.addedNpcs, ];
        console.log('Completed batch', index, this.addedNpcs);
        this.form.controls.index.setValue(index + 1);
        this.addNpcs();
      })
      .catch(console.error);
  }
}
