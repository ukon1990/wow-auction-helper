interface Base<T> {
    id: number;
    petSpeciesId: number;
    history: {[key: string]: T};
    timestamp: number;
}

interface Entry {
    quantity: number;
    price: number
}

interface DailyEntry {
    min: Entry;
    avg: Entry;
    max: Entry;
}

export interface PriceHistoryEntryDBO<T> extends Base<T> {
    ahId: number;
    bonusIds: string; // converted from number[]
}

export interface PriceHistoryEntryDextends<T> extends Base<T> {
    bonusIds: number[];
}

export type HourlyPriceHistoryEntryDBO = PriceHistoryEntryDBO<Entry>;
export type DailyPriceHistoryEntryDBO = PriceHistoryEntryDBO<DailyEntry>;