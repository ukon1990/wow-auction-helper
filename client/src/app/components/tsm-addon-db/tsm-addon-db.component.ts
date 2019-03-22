import {Component, OnInit} from '@angular/core';
import * as lua from 'luaparse';

@Component({
  selector: 'wah-tsm-addon-db',
  templateUrl: './tsm-addon-db.component.html',
  styleUrls: ['./tsm-addon-db.component.scss']
})
export class TsmAddonDbComponent implements OnInit {

  constructor() {
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

    console.log('Original', fields);

    fields.forEach(field => {
      const fRes = this.convertField(field);
      if (fRes.character) {
        if (!result[fRes.type]) {
          result[fRes.type] = {};
        }
        result[fRes.type][fRes.character.realm] = fRes.data;
      } else {
        result[fRes.type] = fRes.data;
      }
    });

    return result;
  }

  private convertField(field: any): any {
    const keys = field.key.value.split('@');
    const character = this.splitCharacterData(keys[1]),
      location = keys[2],
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

  private splitCharacterData(keys): { name: string; faction: string; realm: string; } {
    if (keys && keys[1]) {
      const split = keys[1].split(' - ');

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

          if (character) {
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
