import { SlashCommandPartial, SlashCommandOptionType } from "harmony";

export const commands: SlashCommandPartial[] = [
	{
		name: "ping",
		description: "Pong!", 
		options: [
			{
				name: "channel",
				description: "The channel to ping",
				type: SlashCommandOptionType.STRING,
				required: false,
			}
		]
	},
	{
		name: "admin",
		description: "See/change money stuff",
		options: [
			{
				name: "setbal",
				description: "Set the value of the target user's balance",
				type: SlashCommandOptionType.SUB_COMMAND,
				options: [
					{
						name: "user",
						description: "User this command effects",
						type: SlashCommandOptionType.USER,
						required: true
					},
					{
						name: "amount",
						description: "Amount of money you want to add",
						type: SlashCommandOptionType.INTEGER,
						required: true
					}
				]
			},
			{
				name: "addbal",
				description: "Add money from the target user's balance",
				type: SlashCommandOptionType.SUB_COMMAND,
				options: [
					{
						name: "user",
						description: "User this command effects",
						type: SlashCommandOptionType.USER,
						required: true
					},
					{
						name: "amount",
						description: "Amount of money you want to add",
						type: SlashCommandOptionType.INTEGER,
						required: true
					}
				]
			},
			{
				name: "subtractbal",
				description: "Subtract money from the target user's balance",
				type: SlashCommandOptionType.SUB_COMMAND,
				options: [
					{
						name: "user",
						description: "User this command effects",
						type: SlashCommandOptionType.USER,
						required: true
					},
					{
						name: "amount",
						description: "Amount of money you want to add",
						type: SlashCommandOptionType.INTEGER
					}
				]
			},
		]
	},
	{
		name: "balance",
		description: "Get the balance of another user",
		options: [
			{
				name: "user",
				description: "User you want to get the balance of",
				type: SlashCommandOptionType.USER
			}
		]
	},
	{
		name: "shop",
		description: "Shop for items on the Astoria shop",
		options: []
	},
	{
		name: "inventory",
		description: "View your inventory"
	}
]