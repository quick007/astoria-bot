enum Card {
  Common = 0,
  Rare = 1,
  Legendary = 2,
  Fabled = 3,
  Mythic = 4,
}

enum CardPack {
  Common = 5,
  Rare = 6,
  Legendary = 7,
  Fabled = 8,
  Mythic = 9,
}

export const rewards: RewardPartial[] = [
  {
    balance: 10,
    activeCards: [Card.Common],
    day: 0,
  },
  {
    balance: 20,
    cards: [Card.Common],
    activeCards: [Card.Rare],
    day: 1,
  },
  {
    balance: 40,
    cards: [CardPack.Legendary],
    activeCards: [Card.Mythic],
    day: 3,
  },
];

interface RewardPartial {
  balance: number;
  cards?: number[];
  activeCards?: number[];
  day: number; //technically unnded, nice for management
}
