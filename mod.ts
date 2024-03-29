import {
  ApplicationCommandInteraction,
  Client,
  Embed,
  event,
  GatewayIntents,
  Interaction,
  InteractionUser,
  isMessageComponentInteraction,
  MessageComponentType,
  slash,
  MessageComponentData,
} from "harmony";
import { commands } from "./objects/cmds.ts";
import { sentBy } from "./lib/embed.ts";
import {
  timeToUTCMidnight,
  cardArrayToWords,
  cardsToWords,
} from "./lib/misc.ts";
import { findUser, doDaily, changeBal, BalanceMutationType } from "./lib/db.ts";
import "https://deno.land/std@0.190.0/dotenv/load.ts";

class EcoBot extends Client {
  @event()
  async ready() {
    await console.log("Ready! Running bot as", bot.user!.tag);
        this.interactions.commands
      .bulkEdit(commands, "916006382594064385")
      .then(() => console.log("Commands created!"));
  }

  @event()
  async interactionCreate(d: Interaction) {
    if (!isMessageComponentInteraction(d)) return;
    //if (d.guild == undefined || d.channel == undefined) return;
    //if (d.message.author.id != this.client.user!.id) return;

    await d.reply({
      embeds: [
        new Embed({
          title:
            "Opening " +
            cardsToWords(parseInt(d.customID.toLowerCase())) +
            "...",
        }),
        new Embed({
          image: {
            url: "https://tenor.com/view/whats-in-the-box-box-wondering-unpack-open-gif-16055318",
          },
        }).setAuthor("Give it a second!"),
      ],
    });

    setTimeout(() => {
      d.editResponse({
        embeds: [
          new Embed({
            title: "Opened Card!",
          }),
          new Embed({
            title: "Here's what you got:",
            description: "100000P\n One Raffle Entry",
          }),
        ],
      });
    }, 2000);
  }

  @slash()
  async ping(d: ApplicationCommandInteraction): Promise<void> {
    const desc: string = d.option<string>("channel") || "";
    await d.reply({
      //ephemeral: true,
      embeds: [
        new Embed({
          title: "Pong 🏓",
          description:
            "Sent to " +
            desc +
            " (not actually cause I figured this would be abused)",
        }).setColor("RED"),
      ],
    });
  }

  @slash()
  async balance(d: ApplicationCommandInteraction): Promise<void> {
    const user = d.option<InteractionUser>("user") || undefined; //User from second part of the cmd
    const balance =
      user != undefined
        ? (await findUser(user.id)).bal
        : (await findUser(d.user.id)).bal;
    await d.reply({
      //ephemeral: true,
      embeds: [
        new Embed({
          title: "Balance 💰",
          description:
            (user == undefined ? "You have " : user.mention + " has ") + "$" +
            balance +
            ".",
        }).setColor("#E7D27C"),
      ],
    });
  }

  @slash()
  async profile(d: ApplicationCommandInteraction): Promise<void> {
    const target = d.option<InteractionUser>("user") || undefined;
    const profile =
      target == undefined
        ? await findUser(d.user.id)
        : await findUser(target.id);
    await d.reply({
      embeds: [
        new Embed({
          title: `${
            target == undefined ? "Your" : target.username + "'s"
          } Profile`,
          fields: [
            {
              name: "Balance",
              value: profile.bal.toString(),
            },
            {
              name: "Deck",
              value:
                profile.cards.join(", ") == ""
                  ? "Your deck is empty"
                  : cardArrayToWords(profile.cards).join(", "),
            },
            {
              name: "Inventory",
              value:
                profile.inventory.join(", ") == ""
                  ? "Your inventory is empty"
                  : profile.inventory.join(", "),
            },
          ],
        }).setColor("#E7D27C"),
      ],
    });
  }

  @slash()
  async daily(d: ApplicationCommandInteraction): Promise<void> {
    const daily = await doDaily(d.member!.id, (await d.member?.roles.resolve("916045092840681592") )!= undefined);
    if (daily.failed == true) {
      const midnight = new Date(Date.now()).setUTCHours(24, 0, 0, 0) - Date.now();
      const time = (midnight / 1000)
					.toFixed(
						0,
					);
      await d.reply({
        //ephemeral: true,
        embeds: [
          new Embed({
            title: "You can't do this yet!",
            description:
              "To keep our economy fair for everyone, we allow people to add to their streaks at midnight UTC.",
            fields: [
              {
                inline: true,
                name: "Time until next claim:",
                value: `<t:${time}:R>`,
              },
            ],
            ...sentBy(d),
          }).setColor("#FF6961"),
        ],
      });
    } else {
      await d.reply({
        //ephemeral: true,
        embeds: [
          new Embed({
            title: "Daily Reward Recived!",
            fields: [
              {
                name: "Balance",
                value: daily.balance!.toString(),
              },
              daily.rewards && daily.rewards.length != 0
                ? {
                    name: "Other",
                    value: cardArrayToWords(daily.rewards).join(", "),
                  }
                : {
                    name: "Other",
                    value:
                      "No other rewards 😭. Active rank gets extra rewards! Learn about active rank in <#916045092840681592>.",
                  },
            ],
          }).setColor("#77DD77"),
        ],
      });
    }
  }

  @slash()
  async open(d: ApplicationCommandInteraction): Promise<void> {
    const profile = await findUser(d.user.id);
    if (profile.cards.length == 0) {
      await d.reply({
        embeds: [
          new Embed({
            title: "Your deck is empty 😭",
            description: "You can obtain cards via `/daily`.",
          }),
        ],
      });
      return;
    }
    const crds: MessageComponentData[] = [];
    profile.cards.forEach((v) => {
      const name = cardsToWords(v);
      const output: MessageComponentData = {
        label: name,
        style:
          v == 0 || v == 5
            ? 2
            : v == 1 || v == 6
            ? 1
            : v == 2 || v == 7
            ? 3
            : v == 3 || v == 8
            ? 4
            : v == 4 || v == 9
            ? 1
            : 2,
        type: MessageComponentType.BUTTON,
        customID: v.toString(),
      };
      crds.push(output);
    });
    await d.reply({
      embeds: [
        new Embed({
          title: "Open Cards",
          description: "Select a card from the menu below to open it",
        }),
      ],
      components: [
        {
          type: MessageComponentType.ACTION_ROW,
          components: [...crds],
        },
      ],
    });
  }

  @slash()
  async admin(d: ApplicationCommandInteraction): Promise<void> {
    const user = d.option<InteractionUser>("user");
    const amount = d.option<number>("amount");
    if (d.member && d.member.permissions.has("MANAGE_GUILD", true)) {
      switch (d.subCommand) {
        case "setbal":
          if (amount < 1000000000) {
            await changeBal(user.id, amount, BalanceMutationType.ADD);
            await d.reply({
              //ephemeral: true,
              embeds: [
                new Embed({
                  title: "Balance Updated",
                  description:
                    "Set " + user.mention + "'s balance to $" + amount + ".",
                  ...sentBy(d),
                }).setColor("#77DD77"),
              ],
            });
          } else {
            await d.reply({
              ephemeral: true,
              embeds: [
                new Embed({
                  title: "Error",
                  description: "An unknown error occurred (too much money?)",
                }).setColor("#FF6961"),
              ],
            });
          }
          break;
        case "addbal":
          if (
            d.member &&
            amount < 1000000000
          ) {
            await changeBal(user.id, amount, BalanceMutationType.ADD);
            await d.reply({
              //ephemeral: true,
              embeds: [
                new Embed({
                  title: "Balance Updated",
                  description:
                    "Added $" + amount + " to " + user.mention + "'s balance.",
                }).setColor("#77DD77"),
              ],
            });
          } else {
            await d.reply({
              ephemeral: true,
              embeds: [
                new Embed({
                  title: "Error",
                  description: "An unknown error occurred (too much money?)",
                }).setColor("#FF6961"),
              ],
            });
          }
          break;
        case "subtractbal":
          if (
            d.member &&
            amount < 1000000000
          ) {
            await changeBal(user.id, amount, BalanceMutationType.SUBTRACT);
            await d.reply({
              //ephemeral: true,
              embeds: [
                new Embed({
                  title: "Balance Updated",
                  description:
                    "Set " + user.mention + "'s balance to $" + amount + ".",
                }).setColor("#77DD77"),
              ],
            });
          } else {
            await d.reply({
              ephemeral: true,
              embeds: [
                new Embed({
                  title: "Error",
                  description: "An unknown error occurred (too much money?)",
                }).setColor("#FF6961"),
              ],
            });
          }
      }
    } else {
      await d.reply({
        ephemeral: true,
        embeds: [
          new Embed({
            title: "Error",
            description: "You need the manage server permission to do this.",
          }).setColor("#FF6961"),
        ],
      });
    }
  }
}

const bot = new EcoBot({ clientProperties: {browser: "Discord iOS"}});

/*bot.on('ready', () => {
    console.log('Ready!')
})*/

bot.interactions.on("interactionError", console.error);

bot.setPresence({ type: "CUSTOM_STATUS", name: "Listening to /help (jk)" });

// Proceed with connecting to Discord (login)
bot.connect(Deno.env.get("TOKEN"), [GatewayIntents.GUILD_MEMBERS]);
