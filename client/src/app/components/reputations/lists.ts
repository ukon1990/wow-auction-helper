import { ReputationVendor } from './reputation-vendor.model';

export class ReputationVendors {
  public static standings = [
    {
      id: 0,
      name: 'Hated',
      points: 36000
    }, {
      id: 1,
      name: 'Hostile',
      points: 3000
    }, {
      id: 2,
      name: 'Unfriendly',
      points: 3000
    }, {
      id: 3,
      name: 'Neutral',
      points: 3000
    }, {
      id: 4,
      name: 'Friendly',
      points: 6000
    }, {
      id: 5,
      name: 'Honored',
      points: 12000
    }, {
      id: 6,
      name: 'Revered',
      points: 21000
    }, {
      id: 7,
      name: 'Exalted',
      points: 0
    }
  ];
  public static list = [
    {
      id: 2163,
      name: 'Tortollan Seekers',
      expansion: 7,
      isAlly: true,
      isHorde: true,
      vendors: [
        {
          name: 'Collector Kojo',
          isAlly: true,
          isHorde: true,
          locations: [
            {
              id: 134345,
              zone: 'Zuldazar',
              x: 71.4,
              y: 30.2
            }, {
              id: 135793,
              zone: 'Stormsong Valley',
              x: 40.51,
              y: 36.49
            }
          ]
        }
      ],
      recipesPerProfessionMap: {
        Alchemy: [
          {
            id: 252363,
            itemId: 162136,
            requiredStanding: 6,
            cost: [1400, 0, 0]
          }, {
            id: 252370,
            itemId: 162137,
            requiredStanding: 6,
            cost: [1400, 0, 0]
          }
        ],
        Cooking: [
          {
            id: 259423,
            itemId: 162288,
            requiredStanding: 5,
            cost: [1100, 0, 0]
          }, {
            id: 259423,
            itemId: 162289,
            requiredStanding: 6,
            cost: [1400, 0, 0]
          }, {
            id: 259420,
            itemId: 162287,
            requiredStanding: 6,
            cost: [1400, 0, 0]
          }, {
            id: 259432,
            itemId: 162292,
            requiredStanding: 6,
            cost: [1400, 0, 0]
          }, {
            id: 259435,
            itemId: 162293,
            requiredStanding: 6,
            cost: [1400, 0, 0]
          }
        ],
        Enchanting: [
          {
            id: 255094,
            itemId: 162298,
            requiredStanding: 6,
            cost: [1400, 0, 0]
          }
        ],
        Inscription: [],
        Tailoring: []
      }
    }, {
      id: 2163,
      name: 'Base',
      expansion: 7,
      isAlly: true,
      isHorde: true,
      vendors: [
        {
          name: 'Collector Kojo',
          isAlly: true,
          isHorde: true,
          locations: [
            {
              id: 134345,
              zone: 'Zuldazar',
              x: 71.4,
              y: 30.2
            }
          ],
          recipesPerProfessionMap: {
            Alchemy: [
              {
                id: 252363,
                itemId: 162136,
                requiredStanding: 6,
                cost: [1400, 0, 0]
              },
            ],
            Cooking: [],
            Enchanting: [],
            Inscription: [],
            Tailoring: []
          }
        }
      ];
    }
