import { wrapCollection, disconnect, connect } from "../src"

describe("wrapCollection()", () => {
  it("wraps a collection with custom/dataLoader/collection methods", () => {
    const collection = wrapCollection("tests")

    expect(collection.find).toBeInstanceOf(Function)
    expect(collection.findById).toBeInstanceOf(Function)
    expect(collection.createDocument).toBeInstanceOf(Function)
  })

  it("raises an error when the database is not yet connected", async () => {
    const collection = wrapCollection("tests")

    expect(() => collection.find().toArray()).toThrow(/Not yet connected/)
  })

  describe("when the database is connected", () => {
    afterEach(async (done) => {
      await disconnect()
      done()
    })

    it("uses the connected database", async (done) => {
      const collection = wrapCollection("tests")

      await connect(process.env.MONGO_URL!)

      expect(await collection.find().toArray()).toBeInstanceOf(Array)

      done()
    })
  })
})
