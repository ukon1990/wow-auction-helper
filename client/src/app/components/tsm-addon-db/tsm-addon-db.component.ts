import {Component, OnInit} from '@angular/core';
import * as lua from 'luaparse';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'wah-tsm-addon-db',
  templateUrl: './tsm-addon-db.component.html',
  styleUrls: ['./tsm-addon-db.component.scss']
})
export class TsmAddonDbComponent implements OnInit {
  form: FormGroup;
  dataSets = [
    {
      name: 'csvSales',
      columns: []
    },
    {
      name: 'csvIncome',
      columns: []
    },
    {
      name: 'csvExpired',
      columns: []
    },
    {
      name: 'csvExpense',
      columns: []
    },
    {
      name: 'csvCancelled',
      columns: []
    },
    {
      name: 'csvBuys',
      columns: []
    },
    {
      name: 'characterGuilds',
      columns: []
    },
    {
      name: 'bagQuantity',
      columns: []
    },
    {
      name: 'bankQuantity',
      columns: []
    },
    {
      name: 'goldLog',
      columns: []
    }
  ];
  realms = [];
  characters = [];
  table = {
    columns: [],
    data: []
  };

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      dataset: new FormControl('csvSales'),
      realm: new FormControl('Draenor'),
      character: new FormControl()
    });
  }

  ngOnInit() {
  }

  importFromFile(fileEvent): void {
    console.log('File', fileEvent);
    const files = fileEvent.target.files;
    const reader = new FileReader();
    reader.onload = () => {
      console.log(this.convertList(reader.result));
    };
    reader.readAsText(files[0]);
  }

  convertList(input: any): object {
    const fields = lua.parse(input).body[0].init[0].fields;
    const result = {};

    fields.forEach(field => {
      const fRes = this.convertField(field);
      if (fRes.character && fRes.character.realm) {
        this.addRealmBoundData(fRes, result);

      } else {
        result[fRes.type] = fRes.data;
      }
    });

    return result;
  }

  private addRealmBoundData(fRes, result) {
    if (!result[fRes.type]) {
      result[fRes.type] = {};
    }

    if (fRes.character.name) {
      if (!result[fRes.type][fRes.character.realm]) {
        result[fRes.type][fRes.character.realm] = [];
      }
      result[fRes.type][fRes.character.realm][fRes.character.name] = fRes.data;
    } else {
      result[fRes.type][fRes.character.realm] = fRes.data;
    }
  }

  private convertField(field: any): any {
    const keys = field.key.value.split('@');
    const character = this.splitCharacterData(keys[1]),
      type = keys[3];
    const result = {
      type: type,
      character: character,
      data: undefined
    };

    switch (field.value.type) {
      case 'TableConstructorExpression':
        result.data = this.handleTable(field, character);
        break;
      case 'NumericLiteral':
      case 'BooleanLiteral':
        result.data = field.value.value;
        break;
      case 'StringLiteral' :
        const d = field.value.value.split('\n');
        if (d.length > 0) {
          result.data = [];
          const headers = d[0].split(',');
          for (let i = 1, l = d.length; i < l; i++) {
            const obj = {};
            const columns = d[i].split(',');
            columns.forEach((column, index) => {

              if (!isNaN(+column)) {
                obj[headers[index]] = +column;
              } else if (headers[index] === 'itemString') {
                const tmp = column.split(':');
                obj['itemId'] = +tmp[1];
                obj['bonusIds'] = tmp.slice(2, tmp.length - 1);
              } else {
                obj[headers[index]] = column;
              }
            });
            result.data.push(obj);
          }
        } else {
          result.data = field.value.value;
        }
        break;
      default:
        result.data = field.value;
    }

    return result;
  }

  private splitCharacterData(keys): { name?: string; faction?: string; realm: string; } {
    if (keys) {
      const split = keys.split(' - ');
      console.log('split', split);
      if (split.length === 1) {
        return {realm: split[0]};
      }

      if (split.length === 2) {
        return {
          faction: split[0],
          realm: split[1]
        };
      }

      return {
        name: split[0],
        faction: split[1],
        realm: split[2]
      };
    }
    return undefined;
  }

  private handleTable(field: any, character: any) {
    let result = {};
    if (field.value && field.value.fields) {
      field.value.fields.forEach(column => {
        switch (column.type) {
          case 'TableValue': // Table row?
            result[column.value.type] = this.handleTable(column.value, character);
            break;
          case 'TableKey':
            const o = this.handleTableKey(column, character);
            const id = o.key ? o.key : column.key.value;
            result[id] = o;
            break;
          default:
            console.log(column.type, column);
            break;
        }
      });
    } else {
      // console.log('handleTable', result, type, field);
      result = field.value;
    }
    return result;
  }

  private handleTableKey(column, character: any): any {
    switch (column.type) {
      case 'TableKey':
        if (column.value.fields) {
          const list = [];
          column.value.fields.forEach(field =>
            list.push(field));
          return list;
        } else {
          const obj = {
            key: this.handleKey(column.key.value),
            value: column.value.value
          };

          if (character && character.name) {
            obj['character'] = character.name;
          }

          return obj;
        }
    }
  }

  private handleKey(value) {
    const tmp = value.split(':');
    if (tmp.length > 0) {
      if (isNaN(+tmp[1])) {
        return value;
      }
      return +tmp[1];
    }

    return value;
  }
}
