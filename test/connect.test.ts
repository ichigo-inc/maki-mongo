import connect from "../src/connect"
import disconnect from "../src/disconnect"

describe("connect()", () => {
  afterEach(async () => {
    await disconnect()
  })

  it("connects to a database", async () => {
    const client = await connect(process.env.MONGO_URL!)

    expect(client.isConnected).toEqual(true)
  })
})
