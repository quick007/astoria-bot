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
import { Store } from "./objects/store.ts"

class EcoBot extends Client {
  @event()
  async ready() {
    await console.log("Ready!");
    this.interactions.commands.bulkEdit(commands, "916006382594064385")
      .then(() => console.log("Commands created!"));
  }

  @slash()
  async ping(d: ApplicationCommandInteraction): Promise<void> {
    const desc: string = d.option<string>("channel") || "";
    await d.reply({
      ephemeral: true,
      embeds: [
        new Embed({
          title: "Pong 🏓",
          description: "Sent to " + desc +
            " (not actually cause I figured this would be abused)",
        }).setColor("RED"),
      ],
    });
  }

  @slash()
  async balance(d: ApplicationCommandInteraction): Promise<void> {
    const user = d.option<InteractionUser>("user") || undefined; //User from second part of the cmd
    const money =
      ((user != undefined)
        ? (await db.findUser(user.id)).bal
        : (await db.findUser(d.user.id)).bal);
    await d.reply({
      ephemeral: true,
      embeds: [
        new Embed({
          title: "Balance 🤑",
          description: ((user == undefined
            ? "You have"
            : (user.mention + " has")) + " $" + money + "."),
        }).setColor("lime"),
      ],
    });
  }

  @slash()
  async admin(d: ApplicationCommandInteraction): Promise<void> {
    const user = d.option<InteractionUser>("user");
    const amount = d.option<number>("amount");
    if (d.member && d.member.permissions.has("MANAGE_GUILD")) {
      switch (d.subCommand) {
        case "setbal":
          if (
            amount < 1000000000 && db.changeBal(amount, user.id, "set")
          ) {
            await d.reply({
              //ephemeral: true,
              embeds: [
                new Embed({
                  title: "Balance Updated",
                  description: "Set " + user.mention + "'s balance to $" +
                    amount + ".",
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
            d.member && d.member.permissions.has("MANAGE_GUILD") &&
            amount < 1000000000 && db.changeBal(amount, user.id, "add")
          ) {
            await d.reply({
              //ephemeral: true,
              embeds: [
                new Embed({
                  title: "Balance Updated",
                  description: "Added $" + amount + " to " + user.mention +
                    "'s balance.",
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
            d.member && d.member.permissions.has("MANAGE_GUILD") &&
            amount < 1000000000 && db.changeBal(amount, user.id, "subtract")
          ) {
            await d.reply({
              //ephemeral: true,
              embeds: [
                new Embed({
                  title: "Balance Updated",
                  description: "Set " + user.mention + "'s balance to $" +
                    amount + ".",
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

	@slash()
	async shop(d: ApplicationCommandInteraction): Promise<void> {
    const fields = [];
    
    await d.reply({
      embeds: [
        new Embed({

        })
      ]
    })
    
	}

  @slash()
  async inventory(d: ApplicationCommandInteraction): Promise<void> {
    const user = await db.findUser(d.user.id);
    if (user.inventory.length == 0) {
      d.reply({
        ephemeral: true,
        embeds: [
          new Embed({
            title: "Inventory empty 😭",
            description: "Your inventory in empty"
          }).setColor("red")
        ]
      })
    } else {
      const fields: {name: string, value: string, inline?: boolean}[] = [];
      user.inventory.map((elm) => {
        const name = elm.split(":")[0];
        const value = elm.split(":")[1];
        fields.push({
          inline: false,
          name: name,
          value: value
        })
      })
      d.reply({
        ephemeral: true,
        embeds: [
          new Embed({
            title: "Inventory 📚",
            fields: fields
          })
        ]
        
      })
    }
  }
}

const bot = new EcoBot();

/*bot.on('ready', () => {
    console.log('Ready!')
})*/

bot.interactions.on("interactionError", console.error);

bot.setPresence({ type: "LISTENING", name: " with /help" });

// Proceed with connecting to Discord (login)
bot.connect(Deno.env.get("TOKEN"), [GatewayIntents.GUILD_MEMBERS]);
