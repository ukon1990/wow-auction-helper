export class Locale {
  en_GB: string;
  en_US: string;
  de_DE: string;
  es_ES: string;
  es_MX: string;
  fr_FR: string;
  it_IT: string;
  pl_PL: string;
  pt_PT: string;
  pt_BR: string;
  ru_RU: string;
  ko_KR: string;
  zh_TW: string;
  zh_CN?: string;

  constructor(
    private en: string,
    private de: string,
    private es: string,
    private pt: string,
    private fr: string,
    private it: string,
    private ru: string,
    private cn: string,
    private kr: string
  ) {
    this.en_GB = en;
    this.en_US = en;
    this.de_DE = de;
    this.es_ES = es;
    this.es_MX = es;
    this.pt_BR = pt;
    this.pt_PT = pt;
    this.fr_FR = fr;
    this.it_IT = it;
    this.ru_RU = ru;
    this.zh_CN = cn;
    this.ko_KR = kr;
  }
}
