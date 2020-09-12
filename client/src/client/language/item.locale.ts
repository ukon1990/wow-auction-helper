import {Locale} from '../modules/core/models/locale.model';
import {Local} from 'protractor/built/driverProviders';

class ItemLocaleModel {
  id: number;
  color?: string;
  name: Locale;
}

const itemQualities: ItemLocaleModel[] = [
  {
    id: 0,
    color: '#9d9d9d',
    name: new Locale(
      'Poor',
      'Schlecht',
      'Pobre',
      'Pobre',
      'Médiocre',
      'Scarso',
      'Низкий',
      '贫乏',
      '하급'
    )
  },
  {
    id: 1,
    color: '#ffffff',
    name: new Locale(
      'Common',
      'Gewöhnlich',
      'Común',
      'Comum',
      'Commun',
      'Comune',
      'Обычный',
      '普通',
      '일반'
    )
  },
  {
    id: 2,
    color: '#1eff00',
    name: new Locale(
      'Uncommon',
      'Außergewöhnlich',
      'Poco Común',
      'Incomum',
      'Bonne',
      'Pregiato',
      'Необычный',
      '罕见',
      '고급'
    )
  },
  {
    id: 3,
    color: '#0070dd',
    name: new Locale(
      'Rare',
      'Selten',
      'Raro',
      'Raro',
      'Rare',
      'Raro',
      'Редкий',
      '稀有',
      '희귀'
    )
  },
  {
    id: 4,
    color: '#a335ee',
    name: new Locale(
      'Epic',
      'Episch',
      'Épica',
      'Épico',
      'Épique',
      'Epico',
      'Эпический',
      '史诗',
      '영웅'
    )
  },
  {
    id: 5,
    color: '#ff8000',
    name: new Locale(
      'Legendary',
      'Legendär',
      'Legendaria',
      'Lendário',
      'Légendarie',
      'Leggendario',
      'Легендарный',
      '传奇',
      '전설'
    )
  },
  {
    id: 6,
    color: '#e6cc80',
    name: new Locale(
      'Artifact',
      'Artefakt',
      'Artefacto',
      'Artefato',
      'Artefact',
      'Artefatto',
      'Артефакт',
      '神器',
      '유물'
    )
  },
  {
    id: 7,
    color: '#00ccff',
    name: new Locale(
      'Heirloom',
      'Erbstücke',
      'Reliquia',
      'Herança',
      'Héritage',
      'Cimelio',
      'Наследуемый',
      '传家宝',
      '계승품'
    )
  },
  {
    id: 8,
    color: '#00ccff',
    name: new Locale(
      'Wow Token',
      'Wow-Marke',
      'Ficha de WoW',
      'Ficha de WoW',
      'Jeton WoW',
      'Gettone WoW',
      'Жетон WoW',
      'WoW 时光徽章',
      'WoW 토큰'
    )
  },
];

export class ItemLocale {
  static getQualities(locale: string = localStorage.getItem('locale') || 'en_GB') {
    const list: ItemLocaleModel[] = [];
    const map = new Map<number, ItemLocaleModel>();
    itemQualities.forEach(quality => {
      const result = {
        id: quality.id,
        color: quality.color,
        name: quality.name[locale]
      };
      list.push(result);
      map.set(quality.id, result);
    });
    return {
      list,
      map
    };
  }
}
