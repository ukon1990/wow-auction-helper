export enum ConditionEnum {
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL_TO = 'GREATER_THAN_OR_EQUAL_TO',
  EQUAL_TO = 'EQUAL_TO',
  LESS_THAN_OR_EQUAL_TO = 'LESS_THAN_OR_EQUAL_TO',
  LESS_THAN = 'LESS_THAN',
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  IS_NOT = 'IS_NOT',
}

export const conditionLocale = [
  {
    id: ConditionEnum.GREATER_THAN,
    text: '>',
    tooltip: 'Greater than.'
  },
  {
    id: ConditionEnum.GREATER_THAN_OR_EQUAL_TO,
    text: '>=',
    tooltip: 'Greater than or equal to.'
  },
  {
    id: ConditionEnum.EQUAL_TO,
    text: '=',
    tooltip: 'Is equal/identical to.'
  },
  {
    id: ConditionEnum.LESS_THAN_OR_EQUAL_TO,
    text: '<=',
    tooltip: 'Less than or equal to.'
  },
  {
    id: ConditionEnum.LESS_THAN,
    text: '<',
    tooltip: 'Less than.'
  },
  {
    id: ConditionEnum.CONTAINS,
    text: 'contains',
    tooltip: 'The value contains. Could be used with text etc.'
  },
  {
    id: ConditionEnum.DOES_NOT_CONTAIN,
    text: 'does not contain',
    tooltip: 'Does not contain. Could be used to exclude certain values.'
  },
  {
    id: ConditionEnum.IS_NOT,
    text: 'is not',
    tooltip: 'Is not, can be used to exclude certain values. Eg: an item class or profession.'
  }
];
