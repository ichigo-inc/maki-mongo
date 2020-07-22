import { currentClient, unsetConnection } from "./connectionStatus"

export default async function disconnect() {
  const client = currentClient()

  if (client) {
    await client.close()
    unsetConnection()
  }
}
