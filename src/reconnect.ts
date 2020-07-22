import disconnect from "./disconnect"
import connect from "./connect"

export default async function reconnect(mongoUri: string) {
  await disconnect()
  return await connect(mongoUri)
}
