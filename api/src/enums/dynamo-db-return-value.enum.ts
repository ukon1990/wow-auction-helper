export enum DynamoDbReturnValue {
  /**
   * If ReturnValues is not specified, or if its value is NONE,
   * then nothing is returned. (This setting is the default for ReturnValues.)
   */
  NONE = 'NONE',
  /**
   * Returns all of the attributes of the item, as they appeared before the UpdateItem operation.
   */
  ALL_OLD = 'ALL_OLD',
  /**
   * Returns only the updated attributes, as they appeared before the UpdateItem operation.
   */
  UPDATED_OLD = 'UPDATED_OLD',
  /**
   * Returns all of the attributes of the item, as they appear after the UpdateItem operation.
   */
  ALL_NEW = 'ALL_NEW',
  /**
   * Returns only the updated attributes, as they appear after the UpdateItem operation.
   */
  UPDATED_NEW = 'UPDATED_NEW'
}
