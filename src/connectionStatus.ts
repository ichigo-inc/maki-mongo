import { EventEmitter } from "events"
import { Db, MongoClient } from "mongodb"

let client: MongoClient | undefined = undefined
let db: Db | undefined = undefined

const connectionHandler = new EventEmitter()

export function setConnection(newClient: MongoClient, newDb: Db) {
  db = newDb
  connectionHandler.emit("connected", db)
}

export function unsetConnection() {
  db = undefined
  client = undefined
  connectionHandler.emit("disconnected")
}

export function onConnected(handler: (db: Db) => void) {
  return connectionHandler.on("connected", handler)
}

export function onDisconnected(handler: (db: Db) => void) {
  return connectionHandler.on("disconnected", handler)
}

export function currentClient() {
  return client
}

export function currentDb() {
  return db
}

export function isConnected() {
  return client !== undefined
}
