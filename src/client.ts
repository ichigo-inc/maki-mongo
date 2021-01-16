import { Db, MongoClient } from "mongodb"
import connect from "./connect"
import disconnect from "./disconnect"
import setupCollectionWrapper from "./collection"

export default function createClient() {
  let client: MongoClient | undefined = undefined
  let db: Db | undefined = undefined

  const connectionCallbacks: Array<(db: Db) => void | Promise<void>> = []
  const disconnectionCallbacks: Array<() => void | Promise<void>> = []

  const setConnection = async (newClient: MongoClient, newDb: Db) => {
    client = newClient
    db = newDb
    await Promise.all(connectionCallbacks.map((handler) => handler(newDb)))
  }

  const unsetConnection = async () => {
    db = undefined
    client = undefined
    await Promise.all(disconnectionCallbacks.map((handler) => handler()))
  }

  return {
    async connect(mongoUri: string) {
      const client = await connect(mongoUri)
      await setConnection(client, client.db())
    },

    async disconnect() {
      await disconnect(client)
      await unsetConnection()
    },

    async reconnect(mongoUri: string) {
      await disconnect(client)
      const newClient = await connect(mongoUri)
      setConnection(newClient, newClient.db())
    },

    wrapCollection: setupCollectionWrapper({
      onConnected: (handler) => {
        if (db) {
          handler(db)
        } else {
          connectionCallbacks.push(handler)
        }
      },

      onDisconnected: (handler) => {
        disconnectionCallbacks.push(handler)
      }
    }),

    currentClient() {
      return client
    },

    currentDb() {
      return db
    },

    isConnected() {
      return client !== undefined
    }
  }
}

export type Client = ReturnType<typeof createClient>
