import wrapCollection from "./collection"
import connect from "./connect"
import disconnect from "./disconnect"
import reconnect from "./reconnect"
import { currentClient, currentDb, isConnected } from "./connectionStatus"

export { connect, disconnect, reconnect, currentClient, currentDb, isConnected, wrapCollection }

const caramon = {
  connect,
  disconnect,
  reconnect,
  currentClient,
  currentDb,
  isConnected,
  wrapCollection
}
export default caramon

export * from "./errors"
