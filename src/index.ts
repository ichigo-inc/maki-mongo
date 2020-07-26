import createClient from "./client"

export { createClient }

const defaultClient = createClient()

export const connect = defaultClient.connect
export const disconnect = defaultClient.disconnect
export const reconnect = defaultClient.reconnect
export const wrapCollection = defaultClient.wrapCollection
export const currentClient = defaultClient.currentClient
export const currentDb = defaultClient.currentDb
export const isConnected = defaultClient.isConnected

export default defaultClient

export * from "./errors"

export { Document } from "./collection"
