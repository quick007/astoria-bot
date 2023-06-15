import { rewards } from "../objects/rewards.ts";
import { BalanceMutationType, UserSchema } from "./db.types.ts";

export { BalanceMutationType };

export const db = await Deno.openKv("./kv.db");

export const newUser = async (discordID: string, bal: number) => {
  await db.set(["users", discordID], {
    bal: bal,
    cards: [],
    dateDrawn: new Date().getUTCDate() - 1,
    streak: 0,
    inventory: [],
  } as UserSchema);
};

/**
 * Gets the balance of a user
 * @param discordID The discord id of the user you want to get the balance of
 * @returns The balance & cards of the user in a JSON object
 */
export const findUser = async (discordID: string) => {
  const user = await db.get<UserSchema>(["users", discordID]);

  if (user.value == undefined) {
    await newUser(discordID, 0);
  }

  return (await db.get<UserSchema>(["users", discordID])).value!;
};

/**
 * Modify the balance of a user. Sets the balance if the user isn't in the database
 * @param amount Amount of money you want to add/subtract/set
 * @param discordID The discord id of the user you want to modify
 * @param type Type of balance modification
 * @returns A boolean of whether the transaction worked or not
 */
export const changeBal = async (
  discordID: string,
  bal: number,
  mutationType: BalanceMutationType,
) => {
  const user = await findUser(discordID);
  const newBal = mutationType == "set"
    ? bal
    : mutationType == "add"
    ? user.bal + bal
    : user.bal - bal;

  await db.set(["users", discordID], {
    ...user,
    bal: newBal,
  });
};

export const doDaily: (
  discordID: string,
  active: boolean,
) => Promise<{
  rewards?: number[];
  days?: number;
  balance?: number;
  failed: boolean;
}> = async (discordID, active) => {
  const user = await findUser(discordID);
  if (user.dateDrawn == new Date().getUTCDate()) {
    return {
      failed: true,
    };
  } else {
    const multiplier = active ? 2 : 1; //will flesh out later
    const r = rewards[user.streak];
    await db.set(["users", discordID], {
      ...user,
      streak: user.streak + 1,
      dateDrawn: new Date().getUTCDate(),
      bal: user.bal + r.balance * multiplier,
      cards: user.cards.concat(r.cards == undefined ? [] : r.cards),
    } as UserSchema);
    return {
      balance: r.balance * multiplier,
      rewards: r.cards,
      days: 0,
      failed: false,
    };
  }
};
