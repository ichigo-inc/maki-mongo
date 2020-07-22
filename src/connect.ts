import { MongoClient } from "mongodb"
import { setConnection } from "./connectionStatus"

let connectionPromise: Promise<void> | undefined

export default async function connect(mongoUri: string) {
  if (connectionPromise) {
    return await connectionPromise
  }

  connectionPromise = MongoClient.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then((client) => {
    setConnection(client, client.db())
    connectionPromise = undefined
  })

  return await connectionPromise
}
