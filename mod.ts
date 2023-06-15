import {
  ApplicationCommandInteraction,
  Embed,
  InteractionUser,
  MessageComponentData,
  MessageComponentType,
} from "harmony";
import { commands as cmds, handle, init } from "harmony-deploy";
import { commands } from "./objects/cmds.ts";
import { sentBy } from "./lib/embed.ts";
import { cardArrayToWords, cardsToWords } from "./lib/misc.ts";
import { BalanceMutationType, changeBal, doDaily, findUser } from "./lib/db.ts";
import "https://deno.land/std@0.190.0/dotenv/load.ts";

init({ env: true });

const allCmds = await cmds.all();
if (allCmds.size !== commands.length) {
  cmds
    .bulkEdit(commands, "916006382594064385")
    .then(() => console.log("Commands created!"));
}

handle("ping", (d: ApplicationCommandInteraction) => {
  const desc: string = d.option<string>("channel") || "";
  d.reply({
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
});

handle("balance", async (d: ApplicationCommandInteraction) => {
  const user = d.option<InteractionUser>("user") || undefined; //User from second part of the cmd
  const balance =
    user != undefined
      ? (await findUser(user.id)).bal
      : (await findUser(d.user.id)).bal;
  d.reply({
    embeds: [
      new Embed({
        title: "Balance 💰",
        description:
          (user == undefined ? "You have " : user.mention + " has ") +
          "$" +
          balance +
          ".",
      }).setColor("#E7D27C"),
    ],
  });
});

handle("profile", async (d: ApplicationCommandInteraction) => {
  const target = d.option<InteractionUser>("user") || undefined;
  const profile =
    target == undefined ? await findUser(d.user.id) : await findUser(target.id);
  d.reply({
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
});

handle("daily", async (d: ApplicationCommandInteraction) => {
  const daily = await doDaily(
    d.member!.id,
    (await d.member?.roles.resolve("916045092840681592")) != undefined
  );
  if (daily.failed == true) {
    const midnight = new Date(Date.now()).setUTCHours(24, 0, 0, 0) - Date.now();
    const time = (midnight / 1000).toFixed(0);
    d.reply({
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
    d.reply({
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
});

handle("open", async (d: ApplicationCommandInteraction) => {
  const profile = await findUser(d.user.id);
  if (profile.cards.length == 0) {
    d.reply({
      embeds: [
        new Embed({
          title: "Your deck is empty 😭",
          description: "You can obtain cards via /daily.",
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
  d.reply({
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
});

handle("admin", (d: ApplicationCommandInteraction) => {
  const user = d.option<InteractionUser>("user");
  const amount = d.option<number>("amount");
  if (d.member && d.member.permissions.has("MANAGE_GUILD", true)) {
    switch (d.subCommand) {
      case "setbal":
        if (amount < 1000000000) {
          changeBal(user.id, amount, BalanceMutationType.ADD);
          d.reply({
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
          d.reply({
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
        if (d.member && amount < 1000000000) {
          changeBal(user.id, amount, BalanceMutationType.ADD);
          d.reply({
            embeds: [
              new Embed({
                title: "Balance Updated",
                description:
                  "Added $" + amount + " to " + user.mention + "'s balance.",
              }).setColor("#77DD77"),
            ],
          });
        } else {
          d.reply({
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
        if (d.member && amount < 1000000000) {
          changeBal(user.id, amount, BalanceMutationType.SUBTRACT);
          d.reply({
            embeds: [
              new Embed({
                title: "Balance Updated",
                description:
                  "Set " + user.mention + "'s balance to $" + amount + ".",
              }).setColor("#77DD77"),
            ],
          });
        } else {
          d.reply({
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
    d.reply({
      ephemeral: true,
      embeds: [
        new Embed({
          title: "Error",
          description: "You need the manage server permission to do this.",
        }).setColor("#FF6961"),
      ],
    });
  }
});
