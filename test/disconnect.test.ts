import connect from "../src/connect"
import disconnect from "../src/disconnect"

describe("disconnect()", () => {
  it("disconnects from a database", async () => {
    const client = await connect(process.env.MONGO_URL!)

    expect(client.isConnected()).toEqual(true)

    await disconnect(client)

    expect(client.isConnected()).toEqual(false)
  })
})
