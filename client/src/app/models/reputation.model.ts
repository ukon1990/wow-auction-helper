export class ReputationVendor {
    constructor(
        public id: number,
        public name: string,
        public expansion: number,
        public isAlly: boolean,
        public isHorde: boolean,
        public vendors: {
            name: string,
            isAlly: boolean,
            isHorde: boolean,
            locations: {
                id: number;
                zone: string;
                x: number;
                y: number;
            }[]
        }[],
        public recipesPerProfessionMap: {
            Alchemy: any[];
            Blacksmithing: any[];
            Cooking: any[];
            Leatherworking: any[];
            Mining: any[];
            Tailoring: any[];
            Engineering: any[];
            Enchanting: any[];
            Jewelcrafting: any[];
            Inscription: any[];
        }
    ) {}
}