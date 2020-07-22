import connect from "../src/connect"
import disconnect from "../src/disconnect"
import { currentClient, currentDb } from "../src/connectionStatus"

describe("connect()", () => {
  afterEach(async () => {
    await disconnect()
  })

  it("connects to a database", async () => {
    await connect("mongodb://localhost:27017/caramon_test_database")

    expect(currentClient()).toBeTruthy()
    expect(currentDb()!.databaseName).toEqual("caramon_test_database")
  })
})
