import { Bson, MongoClient } from "mongo";
import "env";

const client = new MongoClient();

await client.connect(Deno.env.get("DBURI") || "").then((_d: unknown) =>
  console.log("Connected to DB!")
);

interface UserSchema {
  _id: Bson.ObjectId;
  discordID: string;
  bal: number;
  inventory: string[];
  timers: Date[];
}

const db = client.database("main");
const users = db.collection<UserSchema>("users");

function newUser(discordID: string, bal: number): void {
  users.insertOne({
    discordID: discordID,
    bal: bal,
    inventory: [],
    timers: [],
  });
}

/**
 * Gets the balance of a user
 * @param discordID The discord id of the user you want to get the balance of
 * @returns The balance & inventory of the user in a JSON object
 */
export async function findUser(discordID: string): Promise<{ bal: number, inventory: string[] }> {
  const user = await users.findOne({ discordID: discordID });
  if (user != undefined) {
    return ({
      bal: user.bal,
	  inventory: user.inventory
    });
  } else {
    await newUser(discordID, 150);
    return ({
      bal: 150,
	  inventory: []
    });
  }
}

/**
 * Modify the balance of a user. Sets the balance if the user isn't in the database
 * @param amount Amount of money you want to add/subtract/set
 * @param discordID The discord id of the user you want to modify
 * @param type Type of balance modification
 * @returns A boolean of whether the transaction worked or not
 */
export async function changeBal(
  amount: number,
  discordID: string,
  type: "add" | "subtract" | "set",
): Promise<boolean> {
  if (type == "add" || "subtract") {
    const user = await users.findOne({ discordID: discordID });
    if (type == "add") {
      const n = (user?.bal || 150) + amount;
      await users.updateOne({ discordID: discordID }, { $set: { bal: n } })
        .catch(() => {
          return false;
        });
      return true;
    }
    if (type == "subtract") {
      const n = (user?.bal || 150) - amount;
      await users.updateOne({ discordID: discordID }, { $set: { bal: n } })
        .catch(() => {
          return false;
        });
      return true;
    }
  }
  if (type == "set") {
    await users.updateOne({ discordID: discordID }, { $set: { bal: amount } })
      .catch(() => {
        return false;
      });
    return true;
  }
  return false;
}
