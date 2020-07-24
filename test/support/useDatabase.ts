import { reconnect, disconnect, currentDb, currentClient } from "../../src"

export default function useDatabase() {
  beforeEach(async (done) => {
    await reconnect(process.env.MONGO_URL!)
    await currentDb()!.dropDatabase()

    done()
  })

  afterEach(async (done) => {
    if (currentClient()?.isConnected) {
      await disconnect()
    }

    done()
  })
}
