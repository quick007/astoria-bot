import { Bson, MongoClient } from "mongo";
import "env";
import { rewards } from "../objects/rewards.ts";

const client = new MongoClient();

await client
  .connect(Deno.env.get("DBURI") || "")
  .then((_d: unknown) => console.log("Connected to DB!"));

interface UserSchema {
  _id: Bson.ObjectId;
  discordID: string;
  bal: number;
  inventory: string[];
  dateDrawn: number;
  streak: number;
}

const db = client.database("main");
const users = db.collection<UserSchema>("users");

function newUser(discordID: string, bal: number): void {
  users.insertOne({
    discordID: discordID,
    bal: bal,
    inventory: [],
    dateDrawn: new Date().getUTCDate(),
    streak: 0,
  });
}

/**
 * Gets the balance of a user
 * @param discordID The discord id of the user you want to get the balance of
 * @returns The balance & inventory of the user in a JSON object
 */
export async function findUser(
  discordID: string
): Promise<{
  bal: number;
  inventory: string[];
  dateDrawn?: number;
  streak: number;
}> {
  const user = await users.findOne({ discordID: discordID });
  if (user != undefined) {
    return {
      bal: user.bal,
      inventory: user.inventory,
      dateDrawn: user.dateDrawn,
      streak: user.streak,
    };
  } else {
    newUser(discordID, 0);
    return {
      bal: 0,
      inventory: [],
      dateDrawn: undefined,
      streak: 0,
    };
  }
}

/**
 * Modify the points of a user. Sets the points if the user isn't in the database
 * @param amount Amount of money you want to add/subtract/set
 * @param discordID The discord id of the user you want to modify
 * @param type Type of points modification
 * @returns A boolean of whether the transaction worked or not
 */ export async function changeBal(
  amount: number,
  discordID: string,
  type: "add" | "subtract" | "set"
): Promise<boolean> {
  if (type == "add" || "subtract") {
    const user = await users.findOne({ discordID: discordID });
    if (type == "add") {
      const n = (user?.bal || 0) + amount;
      await users
        .updateOne({ discordID: discordID }, { $set: { bal: n } })
        .catch(() => {
          return false;
        });
      return true;
    }
    if (type == "subtract") {
      const n = (user?.bal || 0) - amount;
      await users
        .updateOne({ discordID: discordID }, { $set: { bal: n } })
        .catch(() => {
          return false;
        });
      return true;
    }
  }
  if (type == "set") {
    await users
      .updateOne({ discordID: discordID }, { $set: { bal: amount } })
      .catch(() => {
        return false;
      });
    return true;
  }
  return false;
}

export async function doDaily(
  discordID: string,
  active: boolean
): Promise<{ rewards?: string[]; days?: number; failed: boolean }> {
  const user = await findUser(discordID);
  if (user.dateDrawn == new Date().getUTCDate()) {
    return ({
      failed: true
    })
  } else {
  const multiplier = active ? 2 : 1 //will flesh out later
  const r = rewards[user.streak];
  await users.updateOne(
    { discordID: discordID },
    {
      $set: {
        streak: user.streak + 1,
        dateDrawn: new Date().getUTCDate(),
        bal: user.bal + (r.points * multiplier),
        inventory: user.inventory.concat(r.other),
      },
    }
  );
  return {
    rewards: [`Points: ${r.points * multiplier}`].concat(r.other),
    days: 0,
    failed: false,
  };
}
}
