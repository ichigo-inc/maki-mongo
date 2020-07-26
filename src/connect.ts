import { MongoClient } from "mongodb"

let connectionPromise: Promise<MongoClient> | undefined

export default async function connect(mongoUri: string) {
  if (connectionPromise) {
    return await connectionPromise
  }

  connectionPromise = MongoClient.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then((client) => {
    connectionPromise = undefined
    return client
  })

  return await connectionPromise
}
