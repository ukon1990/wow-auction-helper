
/**
 * From HTML
 * 
 * @param {any} itemID 
 * @returns 
 */
module.exports.getExpansion = (b) => {
  var expansionRegex = new RegExp(/Added in patch [0-9]{1,2}\.[0-9]{1,2}/g),
    addedIn = expansionRegex.exec(b);
    if (addedIn && addedIn[0]) {
      return parseInt(addedIn[0].replace('Added in patch ', '').split('.')[0], 10) - 1;
    }
  return 0;
}

module.exports.getDroppedBy = (b) => {
  var droppedByRegex = new RegExp(/new Listview\({template: 'npc', id: 'dropped-by',([\s\S]*?)}\);/g);
  var dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g);
  return dbrx.exec(
    droppedByRegex.exec(b)[0])[0]
    .replace('data: ', '')
    .replace('});', '')
    .replace(/count/g, '\"count\"')
    .replace(/outof/g, '\"outof\"')
    .replace(/personal_loot/g, '\"personal_loot\"')
    .replace(/pctstack/g, '\"pctstack\"')
    .replace(/'{/g,'{')
    .replace(/}'/g,'}');
}

module.exports.getSoldBy = (b) => {
  var droppedByRegex = new RegExp(/new Listview\({template: 'npc', id: 'sold-by',([\s\S]*?)}\);/g);
  var dbrx = new RegExp(/data\: ([\s\S]*?)}\);/g);
  return dbrx.exec(
    droppedByRegex.exec(b)[0])[0]
    .replace('data: ', '')
    .replace('});', '')
    .replace(/count/g, '\"count\"')
    .replace(/outof/g, '\"outof\"')
    .replace(/personal_loot/g, '\"personal_loot\"')
    .replace(/pctstack/g, '\"pctstack\"')
    .replace(/'{/g,'{')
    .replace(/}'/g,'}');
}