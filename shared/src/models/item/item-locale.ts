export class ItemLocale {
    id?: number;
    speciesId?: number;

    en_GB?: string;
    en_US?: string;
    de_DE?: string;
    es_ES?: string;
    es_MX?: string;
    fr_FR?: string;
    it_IT?: string;
    pl_PL?: string;
    pt_PT?: string;
    pt_BR?: string;
    ru_RU?: string;
    ko_KR?: string;
    zh_TW?: string;
    zh_CN?: string;

    constructor(id?: number) {
        this.id = id;
    }
}
