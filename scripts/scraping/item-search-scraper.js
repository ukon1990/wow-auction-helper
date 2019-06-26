/*
    Query URL: https://www.wowhead.com/items?filter=82:2;2:2;80200:0
    TODO: Remember to check for items with name like: REUSE ME
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
            if (s.indexOf("var listviewitems = ") !== -1) {
              const arr = s.replace("var listviewitems = ", "");
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
    const array = eval(input);

    return {
      items: array,
      ids: array.map(i => i.id)
    };
  } catch (e) {
    console.error(e);
    return e;
  }
}

run();
