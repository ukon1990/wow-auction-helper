import {ColumnDescription} from '../../table/models/column-description';
import {RuleField} from '../models/rule-field.model';

export const ruleFields: RuleField[] = [
  {
    key: 'name', name: 'Item name', column: {
      key: 'name', title: 'Name', dataType: 'name'
    }
  },
  {
    key: 'buyout', name: 'Buyout', column: {
      key: 'buyout', title: 'Buyout', dataType: 'name'
    }
  },
  {
    key: 'source.tradeVendor.name', name: 'Dunno', column: {
      key: 'source.tradeVendor.name', title: 'Buyout', dataType: 'name'
    }
  },
];
