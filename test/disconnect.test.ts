import connect from "../src/connect"
import disconnect from "../src/disconnect"
import { currentClient } from "../src/connectionStatus"

describe("disconnect()", () => {
  it("disconnects from a database", async () => {
    await connect(process.env.MONGO_URL!)

    expect(currentClient()).toBeTruthy()

    await disconnect()

    expect(currentClient()).toBeUndefined()
  })
})
