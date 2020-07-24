import reconnect from "../src/reconnect"
import disconnect from "../src/disconnect"
import { currentClient, currentDb } from "../src/connectionStatus"

describe("reconnect()", () => {
  afterEach(async () => {
    await disconnect()
  })

  it("connects to a database", async () => {
    await reconnect(process.env.MONGO_URL!)

    expect(currentClient()).toBeTruthy()
  })
})
