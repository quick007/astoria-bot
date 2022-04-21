import {
  ApplicationCommandInteraction,
  Client,
  Embed,
  event,
  GatewayIntents,
  InteractionUser,
  slash,
} from "harmony";
import "env";
import { commands } from "./objects/cmds.ts";
import * as db from "./lib/mongo.ts";
import { sentBy } from "./lib/embed.ts";
import { timeToUTCMidnight } from "./lib/misc.ts";

class EcoBot extends Client {
  @event()
  async ready() {
    await console.log("Ready!");
    this.interactions.commands
      .bulkEdit(commands, "610564824807636993")
      .then(() => console.log("Commands created!"));
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
  async points(d: ApplicationCommandInteraction): Promise<void> {
    const user = d.option<InteractionUser>("user") || undefined; //User from second part of the cmd
    const points =
      user != undefined
        ? (await db.findUser(user.id)).bal
        : (await db.findUser(d.user.id)).bal;
    await d.reply({
      //ephemeral: true,
      embeds: [
        new Embed({
          title: "Points 🔢",
          description:
            (user == undefined ? "You have" : user.mention + " has ") +
            points +
            ".",
        }).setColor("gold"),
      ],
    });
  }

  @slash()
  async profile(d: ApplicationCommandInteraction): Promise<void> {
    const target = d.option<InteractionUser>("user") || undefined;
    const profile =
      target == undefined
        ? await db.findUser(d.user.id)
        : await db.findUser(target.id);
    await d.reply({
      embeds: [
        new Embed({
          title: `${target == undefined ? "Your" : target.mention + "'s"} Profile`,
          fields: [
            {
              name: "Points",
              value: profile.bal.toString(),
            },
            {
              name: "Inventory",
              value: profile.inventory.join(", "),
            },
          ],
        }),
      ],
    });
  }

  @slash()
  async daily(d: ApplicationCommandInteraction): Promise<void> {
    const daily = await db.doDaily(d.member!.id, false);
    //console.log(await d.member!.roles.get("955596614288937000"))
    if (daily.failed == true) {
      await d.reply({
        //ephemeral: true,
        embeds: [
          new Embed({
            title: "You can't do this yet!",
            description:
              "To keep points fair for everyone, we allow people to add to their streaks at midnight UTC.",
            fields: [
              {
                inline: true,
                name: "Time until next claim:",
                value: timeToUTCMidnight().padStart(5),
              },
            ],
            ...sentBy(d),
          }).setColor("red"),
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
                name: "Points",
                value: daily.rewards![0],
              },
              daily.rewards
                ? {
                    name: "Other",
                    value: daily.rewards?.slice(1).join(", "),
                  }
                : {
                    name: "Other",
                    value:
                      "No other rewards 😭. Active rank gets extra rewards!",
                  },
            ],
          }).setColor("gold"),
        ],
      });
    }
  }

  @slash()
  async admin(d: ApplicationCommandInteraction): Promise<void> {
    const user = d.option<InteractionUser>("user");
    const amount = d.option<number>("amount");
    if (d.member && d.member.permissions.has("MANAGE_GUILD")) {
      switch (d.subCommand) {
        case "setbal":
          if (amount < 1000000000 && db.changeBal(amount, user.id, "set")) {
            await d.reply({
              //ephemeral: true,
              embeds: [
                new Embed({
                  title: "Balance Updated",
                  description:
                    "Set " + user.mention + "'s balance to $" + amount + ".",
                  ...sentBy(d),
                }).setColor("lime"),
              ],
            });
          } else {
            await d.reply({
              ephemeral: true,
              embeds: [
                new Embed({
                  title: "Error",
                  description: "An unknown error occurred (too much money?)",
                }).setColor("red"),
              ],
            });
          }
          break;
        case "addbal":
          if (
            d.member &&
            d.member.permissions.has("MANAGE_GUILD") &&
            amount < 1000000000 &&
            db.changeBal(amount, user.id, "add")
          ) {
            await d.reply({
              //ephemeral: true,
              embeds: [
                new Embed({
                  title: "Balance Updated",
                  description:
                    "Added $" + amount + " to " + user.mention + "'s balance.",
                }).setColor("lime"),
              ],
            });
          } else {
            await d.reply({
              ephemeral: true,
              embeds: [
                new Embed({
                  title: "Error",
                  description: "An unknown error occurred (too much money?)",
                }).setColor("red"),
              ],
            });
          }
          break;
        case "subtractbal":
          if (
            d.member &&
            d.member.permissions.has("MANAGE_GUILD") &&
            amount < 1000000000 &&
            db.changeBal(amount, user.id, "subtract")
          ) {
            await d.reply({
              //ephemeral: true,
              embeds: [
                new Embed({
                  title: "Balance Updated",
                  description:
                    "Set " + user.mention + "'s balance to $" + amount + ".",
                }).setColor("lime"),
              ],
            });
          } else {
            await d.reply({
              ephemeral: true,
              embeds: [
                new Embed({
                  title: "Error",
                  description: "An unknown error occurred (too much money?)",
                }).setColor("red"),
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
          }).setColor("red"),
        ],
      });
    }
  }
}

const bot = new EcoBot();

/*bot.on('ready', () => {
    console.log('Ready!')
})*/

bot.interactions.on("interactionError", console.error);

bot.setPresence({ type: "CUSTOM_STATUS", name: "Listening to /help (jk)" });

// Proceed with connecting to Discord (login)
bot.connect(Deno.env.get("TOKEN"), [GatewayIntents.GUILD_MEMBERS]);
