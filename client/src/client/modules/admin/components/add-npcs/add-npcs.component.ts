import {Component, OnDestroy, OnInit} from '@angular/core';
import {NpcService} from '../../../npc/services/npc.service';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {SharedService} from '../../../../services/shared.service';
import {ItemExtract} from '../../../../utils/item-extract.util';
import {FormControl, FormGroup} from '@angular/forms';
import {ColumnDescription} from '../../../table/models/column-description';
import {GameBuild} from '../../../../utils/game-build.util';
import {NPC} from '../../../npc/models/npc.model';

@Component({
  selector: 'wah-add-npcs',
  templateUrl: './add-npcs.component.html',
  styleUrls: ['./add-npcs.component.scss']
})
export class AddNpcsComponent implements OnInit, OnDestroy {
  list = [];
  npcBatchedIds = [];
  batchSize = 25;
  consecutiveFailedAttempts = 0;
  sm = new SubscriptionManager();
  storageName = 'admin-add-npcs-map';
  addedNpcs = [];
  form: FormGroup = new FormGroup({
    index: new FormControl(0),
    ids: new FormControl('')
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
  existingNPCsMap = {};
  stop = false;

  constructor(private service: NpcService) {
    this.sm.add(SharedService.events.items, () => {
      this.list = ItemExtract.fromItems(SharedService.itemsUnmapped);
      console.log(this.list);
      this.groupIdsIntoBatches();
    });

    this.sm.add(this.form.controls.index.valueChanges, (index) => {
      localStorage.setItem(this.storageName, index);
    });

    this.sm.add(this.form.controls.ids.valueChanges, (ids: string) => {
      this.npcBatchedIds[0] = ids.split(',');
    });

    this.sm.add(NpcService.list, (npcs) => {
      npcs.forEach(npc => this.existingNPCsMap[npc.id] = npc);
      console.log('NPC get all', npcs);
      this.groupIdsIntoBatches();
    });

    this.getAllNPCSFromDBAndSetBatches();
  }

  getAllNPCSFromDBAndSetBatches() {
    /* TODO: So what to do here?
    this.service.getAllAfterTimestamp()
      .then(() => {
      })
      .catch(console.error);*/
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.sm.unsubscribe();
  }

  private groupIdsIntoBatches() {
    this.npcBatchedIds = [];
    const list = this.list.filter(npc => {
      const existing: NPC = this.existingNPCsMap[npc.id];
      if (!existing) {
        return true;
      }
      if (existing.sells && existing.sells.length < npc.sells.length) {
        return true;
      }
      if ((existing.drops && existing.drops.length < npc.drops.length)) {
        return true;
      }
    });
    for (let i = 0; i < list.length; i++) {
      const batchIndex = Math.ceil(i / this.batchSize) - 1;
      if (!this.npcBatchedIds[batchIndex]) {
        this.npcBatchedIds[batchIndex] = [];
      }
      this.npcBatchedIds[batchIndex].push(list[i].id);
    }

    console.log('NPC id batches', this.npcBatchedIds);
  }

  addNpcs() {
    const index = this.form.value.index;
    if (this.stop || index >= this.npcBatchedIds.length) {
      this.stop = false;
      return;
    }
    console.log('Starding on barch ', index);
    this.service.getIds(this.npcBatchedIds[index])
      .then((response: any[]) => {
        console.log(response);
        this.consecutiveFailedAttempts = 0;
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
        })), ...this.addedNpcs];
        console.log('Completed batch', index, this.addedNpcs);
        setTimeout(() => {
          this.form.controls.index.setValue(index + 1);
          this.addNpcs();
        }, this.getRandomMS());
      })
      .catch((error) => {
        this.consecutiveFailedAttempts++;
        const delay = this.getRandomMS() + this.getRandomMS() * this.consecutiveFailedAttempts;
        console.error(`Retrying batch after ${delay}- Error: `, error);
        setTimeout(() => {
          this.addNpcs();
        }, delay);
      });
  }

  private getRandomMS() {
    return Math.round(Math.random() * 1000);
  }
}
