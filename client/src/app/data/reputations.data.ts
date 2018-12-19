export class ReputationVendors {
  public static list = [
    {
      id: 2160,
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
      ]
    }
  ];
}
