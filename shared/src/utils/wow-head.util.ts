/**
 * A method for getting the Tooltip URL for wow head
 * @param isClassic
 * @param id
 * @param type
 * @param localeId
 */
export const getWowHeadTooltipUrl = (isClassic: boolean, id: number, type: string = 'item', localeId: string) =>
  `https://nether.wowhead.com${isClassic ? '/wotlk' : ''}/tooltip/${type}/${id}?dataEnv=1&locale=${localeId}`