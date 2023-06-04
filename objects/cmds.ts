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
		description: "See/change balance",
		options: [
			{
				name: "setbal",
				description: "Set the value of the target user's balance",
				type: SlashCommandOptionType.SUB_COMMAND,
				options: [
					{
						name: "user",
						description: "User this command affects",
						type: SlashCommandOptionType.USER,
						required: true
					},
					{
						name: "amount",
						description: "Amount of balance you want to add",
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
						description: "User this command affects",
						type: SlashCommandOptionType.USER,
						required: true
					},
					{
						name: "amount",
						description: "Amount of balance you want to add",
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
						description: "User this command affects",
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
		name: "daily",
		description: "Get your daily reward! DOUBLE balance with Active rank!"
	},
	{
		name: "profile",
		description: "View your inventory and balance", 
		options: [
			{
				name: "user",
				description: "Target user",
				type: SlashCommandOptionType.USER
			}
		]
	},
	{
		name: "open",
		description: "Open a card or card pack"
	}
]