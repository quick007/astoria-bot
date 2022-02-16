

interface StorePartial {
	object: string; //Object to sell
	desc?: string; //Item description
	price: number; //Cost of item
	role?: string; //Role to give (if applicable)
	id: number;
}

export const Store: StorePartial[] = [
	{
		object: "<@&916023742596009984> Role",
		price: 100,
		role: "916023742596009984",
		id: 1
	},
	{
		object: "Pink Phallic Object",
		desc: "A pink object thats cool",
		price: 500,
		id: 2
	}
]