/**
 * This script is to be ran inside of a browser, to make fetching itemID's used/created in and spellID's from new patches easier
 * url and filter: https://ptr.wowhead.com/leatherworking-spells?filter=21;2;80200
 */

function run() {
  const scripts = $('#main-contents script[type="text/javascript"]');
  Object.keys(scripts).forEach(key => {
    const content = scripts[key].textContent;
    if (content) {
      const listViewsResult = /WH.Gatherer.addData\(3, "[a-zA-Z]{1,5}", {(.|\s)*}\);/g.exec(
        content
      );
      const dbrx = /{(.|\s)*}/g;
      if (
        listViewsResult !== null &&
        listViewsResult &&
        listViewsResult.length > 0
      ) {
        const regexRes = dbrx.exec(listViewsResult[0])[0],
          resultList = regexRes.split(";");
        if (regexRes && resultList) {
          resultList.forEach(s => {
            if (s.indexOf("var listviewspells = ") !== -1) {
              const arr = s.replace("var listviewspells = ", "");
              console.log(convertToArray(arr));
            }
          });
        }
      }
    }
  });
}

function convertToArray(input) {
  try {
    const array = eval(input),
      recipes = [],
      obj = {
        recipes,
        itemIds: [],
        spellIds: []
      };

    array.forEach((r, i) => {
      const recipe = convertToWAHRecipeFormat(r, recipes[i]);
      if (recipe) {
        recipes.push(recipe);
      }
    });

    mapIds(obj);

    return obj;
  } catch (e) {
    console.error(e);
    return e;
  }
}

function addId(itemMap, recipe, resultObject) {
  if (recipe.itemID && !itemMap[recipe.itemID]) {
    itemMap[recipe.itemID] = true;
    resultObject.itemIds.push(recipe.itemID);
  }
}

function mapIds(resultObject) {
  const itemMap = {};
  resultObject.recipes.forEach(recipe => {
    resultObject.spellIds.push(recipe.spellID);
    addId(itemMap, recipe, resultObject);

    recipe.reagents.forEach(item => addId(itemMap, item, resultObject));
  });
}

function setRecipeRank(previousRecipe, recipe) {
  if (previousRecipe) {
    console.log(previousRecipe.name, recipe.name);
  }
  if (previousRecipe && previousRecipe.name === recipe.name) {
    recipe.rank = previousRecipe.rank + 1;
  }
}

function convertToWAHRecipeFormat(recipe, previousRecipe) {
  if (!recipe || !recipe.reagents) {
    console.error("Corrupt recipe", recipe);
    return;
  }
  console.log(previousRecipe);

  const resultObject = {
    spellID: recipe.id,
    itemID: recipe.creates ? recipe.creates[0] : 0,
    name: recipe.name.substring(1, recipe.name.length),
    profession: "Alchemy",
    rank: 1,
    minCount: recipe.creates ? recipe.creates[1] : 1,
    maxCount: recipe.creates ? recipe.creates[2] : 1,
    reagents: [],
    expansion: 7
  };

  setRecipeRank(previousRecipe, resultObject);

  recipe.reagents.forEach(r => {
    resultObject.reagents.push({
      itemID: r[0],
      count: r[1]
    });
  });

  return resultObject;
}

run();
