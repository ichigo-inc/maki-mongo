import { MongoClient } from "mongodb"

export default async function disconnect(client?: MongoClient) {
  if (client) {
    await client.close()
  }
}
