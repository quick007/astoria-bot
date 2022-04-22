interface RewardPartial {
	points: number,
	cards?: number[],
	activeCards?: number[],
	day: number //technically unnded, nice for management
}

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
		points: 10,
		cards: [Card.Common],
		activeCards: [CardPack.Common],
		day: 0
	},
	{
		points: 20,
		cards: [],
		day: 1
	},
	{
		points: 100000,
		cards: [],
		day: 2
	},
]



