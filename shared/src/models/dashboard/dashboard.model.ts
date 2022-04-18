import {ColumnDescription} from '../../models';
import {ItemRule, Rule, SortRule} from '.';

export interface Dashboard {
  id?: string; // UUID type id?
  parentId?: string;
  idParam: string; // The name of the id param for the table -> No longer needed?
  title: string;
  description?: string;
  columns: ColumnDescription[];
  tags?: string[];
  sortOrder: number;
  isDisabled?: boolean;
  isDefault?: boolean;
  onlyItemsWithRules?: boolean;
  sortRule?: SortRule;
  rules: Rule[];
  itemRules?: ItemRule[];

  tsmShoppingString?: string;
  message?: string;
  data: any[];

  isPublic?: boolean;
  createdBy?: string;
  createdById?: string;
  lastModified: number;
  /*
    To indicate if an ID is generated by the backend or not(saved in the backend)
    This because I intend on implementing login functionality in the future,
    and in that case it would be relevant to know if the ID is client or backend generated (in order to create a new one).
   */
  idIsBackendGenerated?: boolean;
}