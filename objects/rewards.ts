interface RewardPartial {
	points: number,
	other: string[],
	day: number //technically unnded, nice for management
}

export const rewards: RewardPartial[] = [
	{
		points: 10,
		other: ["Pink Phallic Object"],
		day: 0
	},
	{
		points: 20,
		other: ["Pink Phallic Objects :flushed:"],
		day: 1
	},
	{
		points: 100000,
		other: ["Gold Experiance Reqrium Phallic Object"],
		day: 2
	},
]