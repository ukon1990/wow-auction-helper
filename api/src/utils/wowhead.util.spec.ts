import {WoWHeadUtil} from './wowhead.util';
import {WoWHead} from '../models/item/wowhead';

fdescribe('WoWHeadUtil', () => {
  /*
    Sources: 31.july 2019
    https://www.wowhead.com/item=109118/blackrock-ore
    https://www.wowhead.com/item=154123/amberblaze#prospected-from
    https://www.wowhead.com/item=153669/viridescent-pigment
   */
  /*
  let body = `
             <script>
              WH.markup.printHtml("[ul][li][url=\\/items?filter=217;1;0]Crafting Reagent[\\/url][\\/li][li][url=https:\\/\\/theunderminejournal.com\\/#item\\/109118][tooltip=tooltip_buyoutprice]Buyout price[\\/tooltip][\\/url]: [money=8407][color=q0] (each)[\\/color][\\/li][li]Added in patch 6.0.1.18125[\\/li][li class=icon-db-link]Icon: [icondb=962047 name=true][\\/li][li]Related building: [building=61 short=true][\\/li][li]Related building: [building=62 short=true][\\/li][li]Related building: [building=63 short=true][\\/li][\\/ul]", "infobox-contents-0", {
                  allow: WH.markup.CLASS.STAFF,
                  dbPage: true,            });
              </script>
              <script type="text/javascript">
    var tabsRelated = new Tabs({parent: WH.ge('jkbfksdbl4'), trackable: 'Item'});
      new Listview({
          template: 'npc',
          id: 'dropped-by',
          name: LANG.tab_droppedby,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          hiddenCols: ['type'],
          extraCols: [Listview.extraCols.count, Listview.extraCols.percent, Listview.extraCols.popularity],
          sort: ['-percent', '-count', 'name'],
          computeDataFunc: Listview.funcBox.initLootTable,
              data: [{"classification":0,"id":80382,"location":[6755],"maxlevel":100,"minlevel":98,"name":"Unstable Earth Spirit","react":[-1,-1],"type":4,"count":40,"outof":154684,"personal_loot":0,"pctstack":"","popularity":11},{"classification":1,"id":75211,"location":[6874],"maxlevel":101,"minlevel":91,"name":"Magma Lord","react":[-1,-1],"type":4,"count":46,"outof":24314,"personal_loot":0,"pctstack":"","popularity":5},{"classification":1,"id":75820,"location":[6874],"maxlevel":101,"minlevel":91,"name":"Vengeful Magma Elemental","react":[-1,-1],"type":4,"count":152,"outof":38035,"personal_loot":0,"pctstack":"","popularity":7},{"classification":1,"id":75209,"location":[6874],"maxlevel":101,"minlevel":91,"name":"Molten Earth Elemental","react":[-1,-1],"type":4,"count":167,"outof":45370,"personal_loot":0,"pctstack":"","popularity":5},{"classification":1,"id":77504,"location":[6967],"maxlevel":102,"minlevel":102,"name":"Slag Behemoth","react":[-1,-1],"type":4,"count":625,"outof":5010,"personal_loot":0,"pctstack":"","popularity":6},{"classification":1,"id":86073,"location":[6996],"maxlevel":102,"minlevel":102,"name":"Lokk","react":[-1,-1],"tag":"Hands of Tectus","type":4,"count":700,"outof":5885,"personal_loot":0,"pctstack":"","popularity":4},{"classification":1,"id":86072,"location":[6996],"maxlevel":102,"minlevel":102,"name":"Oro","react":[-1,-1],"tag":"Wrath of Tectus","type":4,"count":1076,"outof":7631,"personal_loot":0,"pctstack":"","popularity":6},{"classification":1,"id":86071,"location":[6996],"maxlevel":102,"minlevel":102,"name":"Rokkaa","react":[-1,-1],"tag":"Heart of Tectus","type":7,"count":1338,"outof":8039,"personal_loot":0,"pctstack":"","popularity":10},{"classification":0,"id":85294,"location":[6720,6723,6719,-1],"maxlevel":120,"minlevel":91,"name":"Goren Protector","react":[-1,-1],"type":4,"count":297743,"outof":595359,"personal_loot":0,"pctstack":"{4: 0.0107475,5: 0.0345936,6: 0.0450053,7: 0.0628058,8: 0.0560886,9: 33.5518,10: 33.3133,11: 32.9257}","popularity":39}],
      });
      new Listview({
          template: 'spell',
          id: 'created-by-spell',
          name: LANG.tab_createdby,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          extraCols: ['popularity'],
          sort: ['popularity'],
          data: [{"cat":0,"creates":[109118,1,1],"id":157516,"level":0,"name":"7Blackrock Fragment","reagents":[[109992,9]],"schools":1,"popularity":11}],
      });
      new Listview({
          template: 'npc',
          id: 'sold-by',
          name: LANG.tab_soldby,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          hiddenCols: ['level', 'type'],
          extraCols: ['stock', Listview.funcBox.createSimpleCol('stack', 'stack', '10%', 'stack'), 'cost', 'popularity'],
          sort: ['popularity'],
                  data: [{"classification":0,"id":86683,"location":[7004],"maxlevel":100,"minlevel":100,"name":"Tai'tasi","react":[null,1],"tag":"Trader","type":7,"stock":-1,"cost":[0,[[824,24]],[]],"stack":1,"popularity":27},{"classification":0,"id":86779,"location":[7004],"maxlevel":100,"minlevel":100,"name":"Krixel Pinchwhistle","react":[null,1],"tag":"Trader","type":7,"stock":-1,"cost":[0,[[824,24]],[]],"stack":1,"popularity":53},{"classification":0,"id":87200,"location":[7078],"maxlevel":100,"minlevel":100,"name":"Krixel Pinchwhistle","react":[1,null],"tag":"Trader","type":7,"stock":-1,"cost":[0,[[824,24]],[]],"stack":1,"popularity":14},{"classification":0,"id":87204,"location":[7078],"maxlevel":100,"minlevel":100,"name":"Tradesman Portanuus","react":[1,null],"tag":"Trader","type":7,"stock":-1,"cost":[0,[[824,24]],[]],"stack":1,"popularity":8},{"classification":0,"id":86776,"location":[7004],"maxlevel":100,"minlevel":100,"name":"Ribchewer","react":[null,1],"tag":"Trader","type":7,"stock":-1,"cost":[0,[[824,40]],[]],"stack":1,"popularity":46},{"classification":0,"id":87203,"location":[7078],"maxlevel":100,"minlevel":100,"name":"Talgaiir the Ironrender","react":[1,null],"tag":"Trader","type":7,"stock":-1,"cost":[0,[[824,40]],[]],"stack":1,"popularity":56},{"classification":0,"id":86778,"location":[7004],"maxlevel":100,"minlevel":100,"name":"Pyxni Pennypocket","react":[null,1],"tag":"Trader","type":7,"stock":-1,"cost":[0,[[824,32]],[]],"stack":1,"popularity":27},{"classification":0,"id":87201,"location":[7078],"maxlevel":100,"minlevel":100,"name":"Pyxni Pennypocket","react":[1,null],"tag":"Trader","type":7,"stock":-1,"cost":[0,[[824,32]],[]],"stack":1,"popularity":25},{"classification":0,"id":86777,"location":[7004],"maxlevel":100,"minlevel":100,"name":"Elder Surehide","react":[null,1],"tag":"Trader","type":7,"stock":-1,"cost":[0,[[824,16]],[]],"stack":1,"popularity":96},{"classification":0,"id":87202,"location":[7078],"maxlevel":100,"minlevel":100,"name":"Trader Yula","react":[1,null],"tag":"Trader","type":7,"stock":-1,"cost":[0,[[824,16]],[]],"stack":1,"popularity":48}],
      });
      new Listview({
          template: 'item',
          id: 'contained-in-item',
          name: LANG.tab_containedin,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          extraCols: ['count', 'percent', 'popularity'],
          sort: ['-percent', 'name'],
          computeDataFunc: Listview.funcBox.initLootTable,
          data: [{"classs":0,"flags2":8192,"id":114120,"level":100,"name":"6Big Crate of Salvage","reqlevel":100,"slot":0,"subclass":8,"count":278582,"outof":11415193,"pctstack":"{1: 0.0707153,2: 0.0484597,3: 0.0470239,4: 0.0409215,5: 8.49158,6: 8.787,7: 8.29307,8: 8.23923,9: 8.06549,10: 8.10282,11: 8.25394,12: 8.43845,13: 8.14733,14: 8.42589,15: 8.44455,16: 1.60599,17: 1.60599,18: 1.65768,19: 1.54927,20: 1.59271,21: 0.0107688,22: 0.0215376,23: 0.0215376,24: 0.00717921,25: 0.0132815,26: 0.00610233,27: 0.00789714,28: 0.00251273,29: 0.00107688}","popularity":209},{"classs":0,"flags2":8192,"id":114116,"level":100,"name":"7Bag of Salvaged Goods","reqlevel":90,"slot":0,"subclass":8,"count":43623,"outof":1794934,"pctstack":"{1: 0.0641863,2: 0.0458474,3: 0.0550168,4: 0.0481397,5: 8.36027,6: 8.58492,7: 8.41299,8: 8.45426,9: 7.61066,10: 8.29838,11: 8.25253,12: 8.47259,13: 8.91961,14: 8.39007,15: 8.60097,16: 1.39376,17: 1.45795,18: 1.47858,19: 1.40751,20: 1.5634,21: 0.043555,22: 0.0160466,23: 0.0114618,24: 0.0114618,25: 0.00458474,26: 0.00458474,27: 0.0366779}","popularity":12},{"classs":0,"flags2":8192,"id":114119,"level":100,"name":"6Crate of Salvage","slot":0,"subclass":8,"count":10229,"outof":395868,"pctstack":"{1: 0.0488806,2: 0.0977613,3: 0.0195523,5: 6.7553,6: 8.60299,7: 6.54023,8: 7.54717,9: 7.99687,10: 7.81113,11: 6.65754,12: 7.83068,13: 7.39075,14: 6.99971,15: 7.32232,16: 4.07664,17: 3.81269,18: 3.59761,19: 3.43142,20: 3.45097,29: 0.00977613}","popularity":48},{"classs":15,"flags2":8192,"id":118929,"level":1,"name":"5Sack of Mined Ore","reqlevel":100,"slot":0,"source":[4],"sourcemore":[{"c":6874,"c2":2,"n":"Time-Lost Vikings","t":5,"ti":37153}],"subclass":4,"count":6183,"outof":6185,"pctstack":"{15: 5.82242,16: 6.66343,17: 5.30487,18: 6.85751,19: 6.93838,20: 6.11354,21: 7.05159,22: 6.06502,23: 8.86301,24: 8.31312,25: 6.66343,26: 6.2591,27: 5.87094,28: 5.20783,29: 8.00582}","popularity":10}],
      });
      new Listview({
          template: 'object',
          id: 'contained-in-object',
          name: LANG.tab_containedin,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          hiddenCols: ['type'],
          extraCols: ['count', 'percent', 'popularity'],
          sort: ['-percent', 'name'],
          computeDataFunc: Listview.funcBox.initLootTable,
              data: [{"id":241728,"location":[6723],"name":"Elixir of Reckless Power","type":-9,"count":1,"outof":379,"pctstack":"","popularity":5},{"id":239237,"location":[7004],"name":"Mine Work Order","type":45,"count":4,"outof":0,"pctstack":"{1: -25,5: 100,7: 25}","popularity":9},{"id":228024,"location":[6662],"name":"Aruuna Mining Cart","type":-8,"count":8288,"outof":8288,"pctstack":"{13: 13.598,14: 13.8996,15: 17.4952,16: 12.862,17: 15.4078,18: 13.5256,19: 13.2119}","popularity":25},{"id":237452,"location":[6967],"name":"Iron Horde Chest","type":-8,"count":45793,"outof":45793,"pctstack":"{15: 4.97456,16: 5.07501,17: 4.01371,18: 4.11198,19: 4.41552,20: 5.08156,21: 4.51597,22: 5.00513,23: 4.84572,24: 4.77147,25: 4.98548,26: 4.43954,27: 4.31289,28: 4.38932,29: 6.93774,30: 4.93962,31: 3.98969,32: 4.70814,33: 3.90234,34: 5.82403,35: 4.76055}","popularity":7},{"id":232541,"location":[7078,7004,6719,-1],"name":"Mine Cart","type":3,"count":2238621,"outof":4653611,"pctstack":"{1: 20.7687,2: 20.5054,3: 20.7302,4: 0.00245687,5: 9.47655,6: 9.44774,7: 9.52399,8: 9.49527,9: 0.011659,10: 0.0127757,11: 0.012597,12: 0.012597}","popularity":2}],
      });
      new Listview({
          template: 'object',
          id: 'mined-from-object',
          name: LANG.tab_minedfrom,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          extraCols: ['count', 'percent', 'popularity'],
          sort: ['-percent', 'name'],
          computeDataFunc: Listview.funcBox.initLootTable,
              data: [{"id":228563,"location":[6755,6662,6720,-1],"name":"Blackrock Deposit","skill":1,"type":-4,"count":449922,"outof":520063,"pctstack":"{1: 21.0985,2: 37.212,3: 24.1541,4: 17.2623,5: 0.0328932,6: 0.0368937,7: 0.0202249,8: 0.0228919,9: 0.0184469,10: 0.0162243,11: 0.0251144,12: 0.0251144,13: 0.0282259,14: 0.0217806,15: 0.0253367}","popularity":37},{"id":228564,"location":[6755,6719,6720,-1],"name":"Rich Blackrock Deposit","skill":1,"type":-4,"count":62004,"outof":69388,"pctstack":"{1: 13.9233,2: 36.0686,3: 26.687,4: 23.1598,7: 0.0145152,8: 0.016128,9: 0.0064512,10: 0.0129024,11: 0.008064,12: 0.008064,13: 0.0145152,14: 0.0096768,15: 0.0112896,16: 0.016128,18: 0.016128,19: 0.0145152,20: 0.0129024}","popularity":4},{"id":232542,"location":[7078,7004,6719],"name":"Blackrock Deposit","skill":1,"type":-4,"count":1485888,"outof":1486583,"pctstack":"{2: 96.8634,3: 1.49944,4: 1.49785,5: 0.00013543,6: 0.000101572,7: 0.0692384,8: 0.0656157,9: 0.000677148,10: 0.000609433,11: 0.000981865,12: 0.000507861,13: 0.000474004,14: 0.000507861,15: 0.000474004}","popularity":15},{"id":232543,"location":[7078,7004],"name":"Rich Blackrock Deposit","skill":1,"type":-4,"count":950062,"outof":950423,"pctstack":"{1: 0.000847207,2: 97.3731,3: 1.24629,4: 1.22871,9: 0.000635405,10: 0.000370653,11: 0.0741835,12: 0.0745542,13: 0.000158851,14: 0.000529504,15: 0.000635405}","popularity":10},{"id":237359,"location":[6941],"name":"Blackrock Deposit","skill":1,"type":-4,"count":5061,"outof":5757,"pctstack":"{1: 3.00336,2: 33.0567,3: 32.8196,4: 31.1203}","popularity":8},{"id":237360,"location":[6941],"name":"Rich Blackrock Deposit","skill":1,"type":-4,"count":1506,"outof":1700,"pctstack":"{1: 4.11687,2: 30.8765,3: 33.3333,4: 31.6733}","popularity":2},{"id":243312,"location":[6723],"name":"Rich Blackrock Deposit","skill":1,"type":-4,"count":10416,"outof":11297,"pctstack":"{1: 5.01152,2: 32.5173,3: 33.9862,4: 28.485}","popularity":6},{"id":243313,"location":[6723],"name":"Blackrock Deposit","skill":1,"type":-4,"count":133392,"outof":143570,"pctstack":"{1: 4.21764,2: 33.2149,3: 32.1444,4: 30.4231}","popularity":1}],
      });
      new Listview({
          template: 'npc',
          id: 'mined-from-npc',
          name: LANG.tab_minedfromnpc,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          hiddenCols: ['type'],
          extraCols: ['count', 'percent', 'popularity'],
          sort: ['-percent', 'name'],
          computeDataFunc: Listview.funcBox.initLootTable,
              data: [{"classification":1,"id":74475,"location":[6874],"maxlevel":102,"minlevel":92,"name":"Magmolatus","react":[0,0],"tag":"Son of Slag","type":4,"count":856,"outof":5070,"pctstack":"","popularity":20},{"classification":1,"id":75209,"location":[6874],"maxlevel":101,"minlevel":91,"name":"Molten Earth Elemental","react":[-1,-1],"type":4,"count":2302,"outof":16436,"pctstack":"","popularity":5},{"classification":1,"id":75211,"location":[6874],"maxlevel":101,"minlevel":91,"name":"Magma Lord","react":[-1,-1],"type":4,"count":1401,"outof":9296,"pctstack":"","popularity":5},{"classification":1,"id":75820,"location":[6874],"maxlevel":101,"minlevel":91,"name":"Vengeful Magma Elemental","react":[-1,-1],"type":4,"count":2783,"outof":13931,"pctstack":"","popularity":7},{"classification":1,"id":77504,"location":[6967],"maxlevel":102,"minlevel":102,"name":"Slag Behemoth","react":[-1,-1],"type":4,"count":6958,"outof":10451,"pctstack":"","popularity":6},{"classification":0,"id":78327,"location":[6662],"maxlevel":100,"minlevel":100,"name":"Crystal Rager","react":[-1,-1],"type":4,"count":549,"outof":6540,"pctstack":"","popularity":8},{"classification":0,"id":78372,"location":[6662],"maxlevel":102,"minlevel":102,"name":"An'dure the Awakened","react":[-1,-1],"type":4,"count":391,"outof":3432,"pctstack":"","popularity":9},{"classification":1,"id":79924,"location":[6662],"maxlevel":100,"minlevel":100,"name":"Living Apexis Shard","react":[-1,-1],"type":4,"count":69,"outof":793,"pctstack":"","popularity":4},{"classification":0,"id":79926,"location":[6662],"maxlevel":100,"minlevel":94,"name":"Glowing Draenite Crystal","react":[-1,-1],"type":4,"count":516,"outof":5137,"pctstack":"","popularity":11},{"classification":0,"id":80072,"location":[6662],"maxlevel":100,"minlevel":94,"name":"Iridium Geode","react":[0,0],"type":4,"count":3744,"outof":44195,"pctstack":"","popularity":10},{"classification":0,"id":80144,"location":[6755],"maxlevel":100,"minlevel":100,"name":"Raging Crusher","react":[-1,-1],"type":7,"count":1453,"outof":31306,"pctstack":"","popularity":8},{"classification":0,"id":80374,"location":[6755],"maxlevel":102,"minlevel":101,"name":"Unstable Earth Guardian","react":[-1,-1],"type":4,"count":279,"outof":2661,"pctstack":"","popularity":7},{"classification":0,"id":80382,"location":[6755],"maxlevel":100,"minlevel":98,"name":"Unstable Earth Spirit","react":[-1,-1],"type":4,"count":2503,"outof":34232,"pctstack":"","popularity":11},{"classification":1,"id":86071,"location":[6996],"maxlevel":102,"minlevel":102,"name":"Rokkaa","react":[-1,-1],"tag":"Heart of Tectus","type":7,"count":3498,"outof":6685,"pctstack":"","popularity":10},{"classification":1,"id":86072,"location":[6996],"maxlevel":102,"minlevel":102,"name":"Oro","react":[-1,-1],"tag":"Wrath of Tectus","type":4,"count":3932,"outof":6398,"pctstack":"","popularity":6},{"classification":1,"id":86073,"location":[6996],"maxlevel":102,"minlevel":102,"name":"Lokk","react":[-1,-1],"tag":"Hands of Tectus","type":4,"count":1273,"outof":3456,"pctstack":"","popularity":4},{"classification":0,"id":86439,"location":[6721],"maxlevel":100,"minlevel":93,"name":"Earthen Fury","react":[-1,-1],"type":4,"count":350,"outof":4103,"pctstack":"","popularity":9}],
      });
      new Listview({
          template: 'item',
          id: 'currency-for',
          name: LANG.tab_currencyfor,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          extraCols: [Listview.extraCols.cost],
          note: WH.sprintf(LANG.lvnote_filterresults, '/items?filter=118;109118;0'),
          data: [{"classs":9,"flags2":8192,"id":122712,"level":100,"name":"7Schematic: Primal Welding","skill":1,"slot":0,"source":[5],"subclass":3,"cost":[0,[],[[109118,60]]],"stack":1},{"classs":9,"flags2":8192,"id":127721,"level":100,"name":"7Schematic: Bi-Directional Fizzle Reducer","skill":1,"slot":0,"source":[5],"subclass":3,"cost":[0,[],[[109118,60]]],"stack":1},{"classs":9,"flags2":8192,"id":127725,"level":100,"name":"7Recipe: Mighty Steelforged Essence","skill":1,"slot":0,"source":[5],"subclass":4,"cost":[0,[],[[109118,60]]],"stack":1},{"classs":9,"flags2":8192,"id":127726,"level":100,"name":"7Recipe: Mighty Taladite Amplifier","skill":1,"slot":0,"source":[5],"subclass":10,"cost":[0,[],[[109118,60]]],"stack":1},{"classs":9,"flags2":8192,"id":127739,"level":100,"name":"7Schematic: Infrablue-Blocker Lenses","skill":1,"slot":0,"source":[5],"subclass":3,"cost":[0,[],[[109118,60]]],"stack":1},{"classs":9,"flags2":8192,"id":127743,"level":100,"name":"7Recipe: Savage Steelforged Essence","skill":1,"slot":0,"source":[5],"subclass":4,"cost":[0,[],[[109118,60]]],"stack":1},{"classs":9,"flags2":8192,"id":127744,"level":100,"name":"7Recipe: Savage Taladite Amplifier","skill":1,"slot":0,"source":[5],"subclass":10,"cost":[0,[],[[109118,60]]],"stack":1}],
      });
      new Listview({
          template: 'spell',
          id: 'reagent-for',
          name: LANG.tab_reagentfor,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          data: [{"cat":0,"creates":[85790,1,1],"id":161454,"level":0,"name":"5Test for Jon","reagents":[[109118,15]],"schools":1},{"cat":11,"colors":[0,25,27,30],"creates":[109184,5,5],"id":162207,"learnedat":25,"level":0,"name":"7Stealthman 54","nskillup":1,"reagents":[[109118,2],[109119,2],[109128,2]],"schools":1,"skill":[202],"source":[7]},{"cat":11,"colors":[0,100,100,100],"creates":[115526,1,1],"id":170701,"learnedat":100,"level":0,"name":"5Taladite Recrystalizer","nskillup":1,"reagents":[[109118,15],[109119,15]],"schools":1,"skill":[755]},{"cat":11,"colors":[0,50,55,60],"creates":[115988,1,1],"id":170705,"learnedat":50,"level":0,"name":"5Shifting Iron Band","nskillup":1,"reagents":[[109118,30],[109119,30]],"schools":1,"skill":[755],"source":[7]},{"cat":11,"colors":[0,50,55,60],"creates":[115989,1,1],"id":170706,"learnedat":50,"level":0,"name":"5Whispering Iron Band","nskillup":1,"reagents":[[109118,60]],"schools":1,"skill":[755],"source":[7]},{"cat":11,"colors":[0,50,55,60],"creates":[115991,1,1],"id":170708,"learnedat":50,"level":0,"name":"5Shifting Iron Choker","nskillup":1,"reagents":[[109118,30],[109119,30]],"schools":1,"skill":[755],"source":[7]},{"cat":11,"colors":[0,50,55,60],"creates":[115992,1,1],"id":170709,"learnedat":50,"level":0,"name":"5Whispering Iron Choker","nskillup":1,"reagents":[[109118,60]],"schools":1,"skill":[755],"source":[7]},{"cat":11,"colors":[0,50,55,60],"creates":[115994,1,1],"id":170711,"learnedat":50,"level":0,"name":"5Shifting Blackrock Band","nskillup":1,"reagents":[[109118,30],[109119,30]],"schools":1,"skill":[755],"source":[7]},{"cat":11,"colors":[0,50,55,60],"creates":[115995,1,1],"id":170712,"learnedat":50,"level":0,"name":"5Whispering Blackrock Band","nskillup":1,"reagents":[[109118,60]],"schools":1,"skill":[755],"source":[7]},{"cat":11,"colors":[0,100,100,100],"creates":[115803,1,1],"id":170719,"learnedat":100,"level":0,"name":"6Critical Strike Taladite","nskillup":1,"reagents":[[109118,10],[109125,2]],"schools":1,"skill":[755]},{"cat":11,"colors":[0,100,100,100],"creates":[115804,1,1],"id":170720,"learnedat":100,"level":0,"name":"6Haste Taladite","nskillup":1,"reagents":[[109118,10],[109124,2]],"schools":1,"skill":[755]},{"cat":0,"id":170722,"level":0,"name":"@Haste Taladite","reagents":[[109118,10],[109128,2]],"schools":1},{"cat":11,"colors":[0,100,100,100],"creates":[115807,1,1],"id":170723,"learnedat":100,"level":0,"name":"6Versatility Taladite","nskillup":1,"reagents":[[109118,10],[109126,2]],"schools":1,"skill":[755]},{"cat":11,"colors":[0,50,55,60],"creates":[116426,1,1],"id":171691,"learnedat":50,"level":0,"name":"5Smoldering Helm","nskillup":1,"reagents":[[109118,60]],"schools":1,"skill":[164],"source":[7]},{"cat":11,"colors":[0,50,55,60],"creates":[116427,1,1],"id":171692,"learnedat":50,"level":0,"name":"5Smoldering Breastplate","nskillup":1,"reagents":[[109118,30],[109119,30]],"schools":1,"skill":[164],"source":[7]},{"cat":11,"colors":[0,100,100,100],"creates":[116654,1,1],"id":171699,"learnedat":100,"level":0,"name":"5Truesteel Grinder","nskillup":1,"reagents":[[109118,20],[109119,10]],"schools":1,"skill":[164]},{"cat":-15,"id":172835,"level":0,"name":"@Create Shipment - Engineering - Intro Quest","reagents":[[109118,2],[109119,2]],"schools":1},{"cat":-15,"id":172837,"level":0,"name":"@Create Shipment - Jewelcrafting - Intro Quest","reagents":[[109118,5]],"schools":1},{"cat":0,"id":172842,"level":0,"name":"@Create Shipment - Engineering - Shipment","reagents":[[109118,2],[109119,2]],"schools":1},{"cat":0,"id":172844,"level":0,"name":"@Create Shipment - Jewelcrafting - Shipment","reagents":[[109118,5]],"schools":1},{"cat":-15,"id":173059,"level":0,"name":"@Create Shipment - Jewelcrafting - Intro Quest","reagents":[[109118,5]],"schools":1},{"cat":-15,"id":173062,"level":0,"name":"@Create Shipment - Engineering - Intro Quest","reagents":[[109118,2],[109119,2]],"schools":1},{"cat":0,"id":173070,"level":0,"name":"@Create Shipment - Jewelcrafting - Shipment","reagents":[[109118,5]],"schools":1},{"cat":0,"id":173072,"level":0,"name":"@Create Shipment - Engineering - Shipment","reagents":[[109118,2],[109119,2]],"schools":1},{"cat":11,"colors":[0,25,27,30],"creates":[118007,5,5],"id":173308,"learnedat":25,"level":0,"name":"7Mecha-Blast Rocket","nskillup":1,"reagents":[[109118,6]],"schools":1,"skill":[202],"source":[7]},{"cat":-15,"id":173448,"level":0,"name":"@Create Shipment - Trading Post","reagents":[[109118,5]],"schools":1},{"cat":-15,"id":175225,"level":0,"name":"@Create Shipment - Trading Post","reagents":[[109118,5]],"schools":1},{"cat":11,"colors":[0,1,1,1],"creates":[114942,1,1],"id":178550,"learnedat":1,"level":0,"name":"7Draenic Mortar","nskillup":1,"reagents":[[109118,5]],"schools":1,"skill":[773]},{"cat":0,"id":166030,"level":0,"name":"@Repair Item","reagents":[[113203,1],[109118,8]],"schools":1},{"cat":0,"id":166513,"level":0,"name":"@Repair Item","reagents":[[109118,5],[109119,5]],"schools":1},{"cat":0,"id":166574,"level":0,"name":"@Repair Item","reagents":[[113358,1],[109118,4]],"schools":1},{"cat":0,"id":166599,"level":0,"name":"@Repair Item","reagents":[[109118,5],[109119,5]],"schools":1},{"cat":0,"id":166606,"level":0,"name":"@Repair Item","reagents":[[113387,1],[109118,2]],"schools":1},{"cat":0,"id":166611,"level":0,"name":"@Repair Item","reagents":[[113391,1],[109118,4]],"schools":1},{"cat":0,"id":166900,"level":0,"name":"@Repair Item","reagents":[[113452,1],[109118,4]],"schools":1},{"cat":0,"id":166905,"level":0,"name":"@Repair Item","reagents":[[109118,5],[109119,5]],"schools":1},{"cat":0,"id":166909,"level":0,"name":"@Repair Item","reagents":[[113468,1],[109118,8]],"schools":1},{"cat":0,"id":166985,"level":0,"name":"@Repair Item","reagents":[[113483,1],[109118,2],[111557,2]],"schools":1},{"cat":11,"colors":[0,100,100,100],"creates":[114056,1,1],"id":169078,"learnedat":100,"level":0,"name":"5Didi's Delicate Assembly","nskillup":1,"reagents":[[109119,15],[109118,15]],"schools":1,"skill":[202]},{"cat":11,"colors":[0,1,50,100],"creates":[111366,4,4],"id":169080,"learnedat":1,"level":0,"name":"6Gearspring Parts","nskillup":1,"reagents":[[109119,15],[109118,15]],"schools":1,"skill":[202],"source":[7]},{"cat":-15,"id":172855,"level":0,"name":"@Create Shipment - Engineering","reagents":[[109119,2],[109118,2]],"schools":1},{"cat":11,"colors":[0,100,100,100],"creates":[118741,1,1],"id":176732,"learnedat":100,"level":0,"name":"5Mechanical Scorpid","nskillup":1,"reagents":[[111366,30],[109118,10]],"schools":1,"skill":[202]},{"cat":0,"creates":[111366,10,10],"id":178242,"level":0,"name":"6Gearspring Parts","nskillup":1,"reagents":[[109119,10],[109118,10]],"schools":1,"skill":[202]},{"cat":11,"colors":[0,100,100,100],"creates":[111366,2,2],"id":182120,"learnedat":100,"level":0,"name":"6Primal Welding","nskillup":1,"reagents":[[120945,1],[109118,5],[109119,5]],"schools":1,"skill":[202]},{"cat":11,"colors":[0,100,100,100],"creates":[115524,2,2],"id":182127,"learnedat":100,"level":0,"name":"6Primal Gemcutting","nskillup":1,"reagents":[[120945,1],[109118,5],[109119,5]],"schools":1,"skill":[755]},{"cat":0,"id":166915,"level":0,"name":"@Repair Item","reagents":[[113471,1],[109119,4],[109118,4]],"schools":1},{"cat":11,"colors":[0,1,50,100],"creates":[115524,1,1],"id":170700,"learnedat":1,"level":0,"name":"6Taladite Crystal","nskillup":1,"reagents":[[109118,20],[109119,10]],"schools":1,"skill":[755],"source":[7]},{"cat":11,"colors":[0,100,100,100],"creates":[115794,1,1],"id":170713,"learnedat":100,"level":0,"name":"4Glowing Taladite Ring","nskillup":1,"reagents":[[115524,100],[109118,10],[109119,10]],"schools":1,"skill":[755]},{"cat":11,"colors":[0,100,100,100],"creates":[115796,1,1],"id":170714,"learnedat":100,"level":0,"name":"4Shifting Taladite Ring","nskillup":1,"reagents":[[115524,100],[109118,10],[109119,10]],"schools":1,"skill":[755]},{"cat":11,"colors":[0,100,100,100],"creates":[115798,1,1],"id":170715,"learnedat":100,"level":0,"name":"4Whispering Taladite Ring","nskillup":1,"reagents":[[115524,100],[109118,10],[109119,10]],"schools":1,"skill":[755]},{"cat":11,"colors":[0,100,100,100],"creates":[115799,1,1],"id":170716,"learnedat":100,"level":0,"name":"4Glowing Taladite Pendant","nskillup":1,"reagents":[[115524,100],[109118,10],[109119,10]],"schools":1,"skill":[755]},{"cat":11,"colors":[0,100,100,100],"creates":[115800,1,1],"id":170717,"learnedat":100,"level":0,"name":"4Shifting Taladite Pendant","nskillup":1,"reagents":[[115524,100],[109118,10],[109119,10]],"schools":1,"skill":[755]},{"cat":11,"colors":[0,100,100,100],"creates":[115801,1,1],"id":170718,"learnedat":100,"level":0,"name":"4Whispering Taladite Pendant","nskillup":1,"reagents":[[115524,100],[109118,10],[109119,10]],"schools":1,"skill":[755]},{"cat":0,"creates":[115524,1,1],"id":170832,"level":0,"name":"6Taladite Crystal","nskillup":1,"reagents":[[109118,20],[109119,10]],"schools":1,"skill":[755]},{"cat":-15,"id":172857,"level":0,"name":"@Create Shipment - Jewelcrafting","reagents":[[109118,5]],"schools":1},{"cat":11,"colors":[0,1,50,100],"creates":[118723,1,1],"id":176087,"learnedat":1,"level":0,"name":"7Secrets of Draenor Jewelcrafting","nskillup":1,"reagents":[[109118,5]],"schools":1,"skill":[755],"source":[7]},{"cat":11,"colors":[0,100,100,100],"creates":[108257,2,2],"id":182116,"learnedat":100,"level":0,"name":"6Riddle of Truesteel","nskillup":1,"reagents":[[120945,1],[109119,5],[109118,5]],"schools":1,"skill":[164]},{"cat":0,"creates":[112090,1,1],"id":156583,"level":0,"name":"7UNUSED","reagents":[[109118,3]],"schools":1},{"cat":0,"creates":[111403,1,1],"id":156586,"level":0,"name":"7Alchemist's Cauldron","reagents":[[109088,3],[109118,3]],"schools":1},{"cat":11,"colors":[0,1,50,100],"creates":[108996,1,1],"id":156587,"learnedat":1,"level":0,"name":"6Alchemical Catalyst","nskillup":1,"reagents":[[109124,20],[109118,10]],"schools":1,"skill":[171],"source":[7]},{"cat":0,"id":156588,"level":0,"name":"@Alchemical Catalyst - Fireweed","nskillup":1,"reagents":[[109125,20],[109118,3]],"schools":1,"skill":[171]},{"cat":0,"id":156589,"level":0,"name":"@Alchemical Catalyst - Flytrap","nskillup":1,"reagents":[[109126,20],[109118,3]],"schools":1,"skill":[171]},{"cat":0,"id":156590,"level":0,"name":"@Alchemical Catalyst - Starflower","nskillup":1,"reagents":[[109127,20],[109118,3]],"schools":1,"skill":[171]},{"cat":0,"id":156592,"level":0,"name":"@Alchemical Catalyst - Orchid","nskillup":1,"reagents":[[109129,20],[109118,3]],"schools":1,"skill":[171]},{"cat":0,"id":156593,"level":0,"name":"@Alchemical Catalyst - Lotus","nskillup":1,"reagents":[[109130,1],[109118,3]],"schools":1,"skill":[171]},{"cat":0,"creates":[111403,1,1],"id":163486,"level":0,"name":"7Alchemist's Cauldron - Orchid","reagents":[[109129,20],[109118,3]],"schools":1},{"cat":0,"creates":[111403,1,1],"id":163487,"level":0,"name":"7Alchemist's Cauldron - Lotus","reagents":[[109130,5],[109118,3]],"schools":1},{"cat":0,"creates":[111403,1,1],"id":163488,"level":0,"name":"7Alchemist's Cauldron - Frostweed","reagents":[[109124,20],[109118,3]],"schools":1},{"cat":0,"creates":[111403,1,1],"id":163489,"level":0,"name":"7Alchemist's Cauldron - Fireweed","reagents":[[109125,20],[109118,3]],"schools":1},{"cat":0,"creates":[111403,1,1],"id":163490,"level":0,"name":"7Alchemist's Cauldron - Flytrap","reagents":[[109126,20],[109118,3]],"schools":1},{"cat":0,"creates":[111403,1,1],"id":163491,"level":0,"name":"7Alchemist's Cauldron - Starflower","reagents":[[109127,20],[109118,3]],"schools":1},{"cat":0,"creates":[111403,1,1],"id":163493,"level":0,"name":"7Alchemist's Cauldron - Arrowbloom","reagents":[[109128,20],[109118,3]],"schools":1},{"cat":0,"id":167617,"level":0,"name":"@Alchemist's Cauldron - Flytrap","reagents":[[109126,20],[109118,3]],"schools":1},{"cat":0,"id":167618,"level":0,"name":"@Alchemist's Cauldron - Lotus","reagents":[[109130,5],[109118,3]],"schools":1},{"cat":0,"id":167619,"level":0,"name":"@Alchemist's Cauldron - Orchid","reagents":[[109129,20],[109118,3]],"schools":1},{"cat":0,"id":167620,"level":0,"name":"@Alchemist's Cauldron - Arrowbloom","reagents":[[109128,20],[109118,3]],"schools":1},{"cat":0,"id":167621,"level":0,"name":"@Alchemist's Cauldron - Starflower","reagents":[[109127,20],[109118,3]],"schools":1},{"cat":0,"id":167622,"level":0,"name":"@Alchemist's Cauldron","reagents":[[109124,20],[109118,3]],"schools":1},{"cat":0,"id":167623,"level":0,"name":"@Alchemist's Cauldron - Fireweed","reagents":[[109125,20],[109118,3]],"schools":1},{"cat":0,"creates":[108996,1,1],"id":168042,"level":0,"name":"6Alchemical Catalyst","nskillup":1,"reagents":[[109124,20],[109118,10]],"schools":1,"skill":[171]},{"cat":11,"colors":[0,1,50,100],"creates":[108257,1,1],"id":171690,"learnedat":1,"level":0,"name":"6Truesteel Ingot","nskillup":1,"reagents":[[109119,20],[109118,10]],"schools":1,"skill":[164],"source":[7]},{"cat":11,"colors":[0,100,100,100],"creates":[116453,1,1],"id":171694,"learnedat":100,"level":0,"name":"5Steelforged Greataxe","nskillup":1,"reagents":[[108257,100],[109119,20],[109118,20]],"schools":1,"skill":[164]},{"cat":11,"colors":[0,100,100,100],"creates":[116454,1,1],"id":171695,"learnedat":100,"level":0,"name":"5Steelforged Saber","nskillup":1,"reagents":[[108257,100],[109119,20],[109118,20]],"schools":1,"skill":[164]},{"cat":11,"colors":[0,100,100,100],"creates":[116644,1,1],"id":171696,"learnedat":100,"level":0,"name":"5Steelforged Dagger","nskillup":1,"reagents":[[108257,100],[109119,20],[109118,20]],"schools":1,"skill":[164]},{"cat":11,"colors":[0,100,100,100],"creates":[116646,1,1],"id":171697,"learnedat":100,"level":0,"name":"5Steelforged Hammer","nskillup":1,"reagents":[[108257,100],[109119,20],[109118,20]],"schools":1,"skill":[164]},{"cat":11,"colors":[0,100,100,100],"creates":[116647,1,1],"id":171698,"learnedat":100,"level":0,"name":"4Steelforged Shield","nskillup":1,"reagents":[[108257,100],[109119,20],[109118,20]],"schools":1,"skill":[164]},{"cat":0,"creates":[108257,1,1],"id":171718,"level":0,"name":"6Truesteel Ingot","reagents":[[109119,20],[109118,10]],"schools":1},{"cat":11,"colors":[0,100,100,100],"creates":[120259,1,1],"id":178243,"learnedat":100,"level":0,"name":"5Steelforged Axe","nskillup":1,"reagents":[[108257,100],[109119,20],[109118,20]],"schools":1,"skill":[164]},{"cat":11,"colors":[0,100,100,100],"creates":[120261,1,1],"id":178245,"learnedat":100,"level":0,"name":"4Steelforged Aegis","nskillup":1,"reagents":[[108257,100],[109119,20],[109118,20]],"schools":1,"skill":[164]}],
      });
      new Listview({
          template: 'quest',
          id: 'objective-of',
          name: LANG.tab_objectiveof,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          data: [{"category":-403,"category2":26,"currencyrewards":[[824,250]],"daily":1,"id":37324,"level":90,"name":"Out of Stock: Blackrock Ore","reqlevel":90,"side":3,"wflags":2},{"category":-403,"category2":26,"daily":1,"id":38243,"itemrewards":[[120945,25]],"name":"A Bit of Ore","reqlevel":90,"side":3,"wflags":18}],
      });
      new Listview({
          template: 'item',
          id: 'can-be-placed-in',
          name: LANG.tab_canbeplacedin,
          tabs: 'tabsRelated',
          parent: 'lkljbjkb574',
          data: [{"classs":1,"flags2":8192,"id":30745,"level":60,"name":"7Heavy Toolbox","nslots":20,"slot":18,"slotbak":18,"source":[5],"subclass":4},{"classs":1,"flags2":8192,"id":67390,"level":60,"name":"7\\"Carriage - Maddy\\" High Tech Bag","nslots":20,"slot":18,"slotbak":18,"source":[5],"sourcemore":[{"n":"Dawn Radue","t":1,"ti":50669,"z":1519}],"subclass":4},{"classs":1,"flags2":8192,"id":23774,"level":65,"name":"6Fel Iron Toolbox","nslots":24,"slot":18,"slotbak":18,"source":[1],"sourcemore":[{"c":11,"icon":"inv_misc_enggizmos_18","n":"Fel Iron Toolbox","s":202,"t":6,"ti":30348}],"subclass":4},{"classs":1,"flags2":8192,"id":23775,"level":75,"name":"5Titanium Toolbox","nslots":32,"slot":18,"slotbak":18,"source":[1],"sourcemore":[{"c":11,"icon":"inv_misc_enggizmos_19","n":"Titanium Toolbox","s":202,"t":6,"ti":30349}],"subclass":4},{"classs":1,"flags2":8192,"id":60217,"level":85,"name":"5Elementium Toolbox","nslots":36,"slot":18,"slotbak":18,"source":[1],"sourcemore":[{"c":11,"icon":"inv_misc_enggizmos_34","n":"Elementium Toolbox","s":202,"t":6,"ti":84416}],"subclass":4},{"classs":1,"flags2":8192,"id":30746,"level":60,"name":"7Mining Sack","nslots":20,"slot":18,"slotbak":18,"source":[5],"subclass":6},{"classs":1,"flags2":8192,"id":67396,"level":35,"name":"7\\"Carriage - Christina\\" Precious Metal Bag","nslots":20,"slot":18,"slotbak":18,"source":[5],"sourcemore":[{"n":"Dawn Radue","t":1,"ti":50669,"z":1519}],"subclass":6},{"classs":1,"flags2":8192,"id":29540,"level":65,"name":"6Reinforced Mining Bag","nslots":28,"slot":18,"slotbak":18,"source":[1],"sourcemore":[{"c":11,"icon":"inv_misc_bag_15","n":"Reinforced Mining Bag","s":165,"t":6,"ti":35530}],"subclass":6},{"classs":1,"flags2":8192,"id":38347,"level":75,"name":"5Mammoth Mining Bag","nslots":32,"slot":18,"slotbak":18,"source":[1],"sourcemore":[{"c":11,"icon":"inv_misc_bag_16","n":"Mammoth Mining Bag","s":165,"t":6,"ti":50971}],"subclass":6},{"classs":1,"flags2":8192,"id":70137,"level":85,"name":"5Triple-Reinforced Mining Bag","nslots":36,"slot":18,"slotbak":18,"source":[1],"sourcemore":[{"c":11,"icon":"inv_misc_bag_29","n":"Triple-Reinforced Mining Bag","s":165,"t":6,"ti":100586}],"subclass":6},{"classs":1,"flags2":8192,"id":116260,"level":100,"name":"5Burnished Mining Bag","nslots":36,"slot":18,"slotbak":18,"source":[1],"sourcemore":[{"c":11,"icon":"inv_misc_bag_34","n":"Burnished Mining Bag","s":165,"t":6,"ti":171289}],"subclass":6}],
      });
      new Listview({
        template: 'item',
        id: 'milled-from',
        name: LANG.tab_milledfrom,
        tabs: 'tabsRelated',
        parent: 'lkljbjkb574',
        extraCols: ['count', 'percent', 'popularity'],
        sort: ['-percent', 'name'],
        computeDataFunc: Listview.funcBox.initLootTable,
            data: [{"classs":7,"flags2":-2147475456,"id":152505,"level":111,"name":"7Riverbud","slot":0,"source":[1,2,16,17],"sourcemore":[{"c":11,"icon":"inv_misc_herb_riverbud","n":"Mass Mill Riverbud","s":773,"t":6,"ti":256217}],"subclass":9,"count":1467,"outof":5291,"pctstack":"{1: 36.8098,2: 37.4915,3: 25.6987}","popularity":771},{"classs":7,"flags2":-2147475456,"id":152506,"level":111,"name":"7Star Moss","slot":0,"source":[1,2,16,17],"sourcemore":[{"c":11,"icon":"inv_misc_herb_starmoss","n":"Mass Mill Star Moss","s":773,"t":6,"ti":256218}],"subclass":9,"count":1797,"outof":6876,"pctstack":"{1: 39.2877,2: 32.6656,3: 28.0467}","popularity":1793},{"classs":7,"flags2":-2147475456,"id":152507,"level":111,"name":"7Akunda's Bite","slot":0,"source":[1,2,17],"sourcemore":[{"c":11,"icon":"inv_misc_herb_akundasbite","n":"Mass Mill Akunda's Bite","s":773,"t":6,"ti":256219}],"subclass":9,"count":1111,"outof":3071,"pctstack":"{1: 29.883,2: 23.4923,3: 46.6247}","popularity":1916},{"classs":7,"flags2":-2147475456,"id":152508,"level":111,"name":"7Winter's Kiss","slot":0,"source":[1,2,17],"sourcemore":[{"c":11,"icon":"inv_misc_herb_winterskiss","n":"Mass Mill Winter's Kiss","s":773,"t":6,"ti":256220}],"subclass":9,"count":1340,"outof":5316,"pctstack":"{1: 35.4478,2: 36.3433,3: 28.209}","popularity":815},{"classs":7,"flags2":-2147475456,"id":152509,"level":111,"name":"7Siren's Pollen","slot":0,"source":[1,2,17],"sourcemore":[{"c":11,"icon":"inv_misc_herb_pollen","n":"Mass Mill Siren's Pollen","s":773,"t":6,"ti":256221}],"subclass":9,"count":1858,"outof":6995,"pctstack":"{1: 27.8256,2: 43.8106,3: 28.3638}","popularity":833},{"classs":7,"flags2":-2147475456,"id":152510,"level":111,"name":"6Anchor Weed","reqlevel":120,"slot":0,"source":[1,2,4,17],"sourcemore":[{"c":11,"icon":"inv_misc_herb_anchorweed","n":"Mass Mill Anchor Weed","s":773,"t":6,"ti":256308}],"subclass":9,"count":888,"outof":948,"pctstack":"{1: 98.8739,3: 1.12613}","popularity":3057},{"classs":7,"flags2":-2147475456,"id":152511,"level":111,"name":"7Sea Stalk","slot":0,"source":[1,2,16,17],"sourcemore":[{"c":11,"icon":"inv_misc_herb_seastalk","n":"Mass Mill Sea Stalk","s":773,"t":6,"ti":256223}],"subclass":9,"count":1603,"outof":6344,"pctstack":"{1: 40.0499,2: 34.9969,3: 24.9532}","popularity":593}],
    });
    new Listview({
        template: 'item',
        id: 'prospected-from',
        name: LANG.tab_prospectedfrom,
        tabs: 'tabsRelated',
        parent: 'lkljbjkb574',
        extraCols: [Listview.extraCols.count, Listview.extraCols.percent],
        sort:['-percent', 'name'],
        computeDataFunc: Listview.funcBox.initLootTable,
            data: [{"classs":7,"flags2":-2147475456,"id":152512,"level":111,"name":"7Monelite Ore","slot":0,"source":[1,2,19,23],"sourcemore":[{"c":11,"icon":"inv_ore_monalite","n":"Mass Prospect Monelite","s":755,"t":6,"ti":256611}],"subclass":7,"count":997,"outof":24406,"pctstack":""},{"classs":7,"flags2":-2147475456,"id":152513,"level":111,"name":"6Platinum Ore","slot":0,"source":[1,2,19],"sourcemore":[{"c":11,"icon":"inv_ore_platinum","n":"Mass Prospect Platinum","s":755,"t":6,"ti":256622}],"subclass":7,"count":2011,"outof":17036,"pctstack":""},{"classs":7,"flags2":-2147475456,"id":152579,"level":111,"name":"7Storm Silver Ore","slot":0,"source":[1,2,19,23],"sourcemore":[{"c":11,"icon":"inv_ore_stormsilver","n":"Mass Prospect Storm Silver","s":755,"t":6,"ti":256613}],"subclass":7,"count":1712,"outof":26384,"pctstack":""}],
    });
</script>`;*/

  describe('setValuesAll', () => {
    let blackrockOre: WoWHead;
    let amberblaze: WoWHead;
    let viridescentPigment: WoWHead;

    beforeAll(async () => {
      // result = WoWHeadUtil.setValuesAll(body);
      blackrockOre = await WoWHeadUtil.getWowHeadData(109118);
      amberblaze = await WoWHeadUtil.getWowHeadData(154123);
      viridescentPigment = await WoWHeadUtil.getWowHeadData(153669);
    });

    it('getExpansion', async () => {
      expect(blackrockOre.expansionId).toBe(5);
    });

    it('getDroppedBy', async () => {
      expect(blackrockOre.droppedBy.length).toBe(8);
      expect(amberblaze.droppedBy.length).toBe(0);
    });

    it('containedInObject', async () => {
      expect(blackrockOre.containedInObject.length).toBe(5);
    });

    it('containedInItem', async () => {
      expect(blackrockOre.containedInItem.length).toBe(4);
    });

    it('currencyFor', async () => {
      expect(blackrockOre.currencyFor.length).toBe(7);
    });

    it('soldBy', async () => {
      expect(blackrockOre.soldBy.length).toBe(10);
    });

    it('milledFrom', async () => {
      expect(viridescentPigment.milledFrom.length).toBe(7);
    });

    it('prospectedFrom', async () => {
      expect(amberblaze.prospectedFrom.length).toBe(3);
    });

    it('Empty if not found in body or non accepted js found', () => {
      expect(WoWHeadUtil.setValuesAll('').milledFrom).toEqual([]);
      expect(WoWHeadUtil.setValuesAll(`
      new Listview({
        template: 'item',
        id: 'prospected-from',
        name: LANG.tab_prospectedfrom,
        tabs: 'tabsRelated',
        parent: 'lkljbjkb574',
        extraCols: [Listview.extraCols.count, Listview.extraCols.percent],
        sort:['-percent', 'name'],
        computeDataFunc: Listview.funcBox.initLootTable,
              data: [{dfgjhk],
      });`).milledFrom).toEqual([]);
    });
  });
});
