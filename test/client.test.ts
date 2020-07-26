import createClient, { Client } from "../src/client"
import { MongoClient, Db } from "mongodb"

describe("createClient()", () => {
  let client: Client | undefined

  beforeEach(() => {
    client = createClient()
  })

  describe(".connect()", () => {
    afterEach(async (done) => {
      await client!.disconnect()
      done()
    })

    it("connects to a database", async (done) => {
      await client!.connect(process.env.MONGO_URL!)

      expect(client!.isConnected()).toEqual(true)

      done()
    })
  })

  describe(".reconnect()", () => {
    afterEach(async (done) => {
      await client!.disconnect()
      done()
    })

    it("connects to a database", async (done) => {
      await client!.reconnect(process.env.MONGO_URL!)

      expect(client!.isConnected()).toEqual(true)

      done()
    })
  })

  describe(".wrapCollection()", () => {
    it("wraps a collection", () => {
      const collection = client!.wrapCollection("things")

      expect(collection.createDocument).toBeDefined()
    })
  })

  describe(".currentClient()", () => {
    it("returns the current client", async (done) => {
      expect(client!.currentClient()).toBeUndefined()

      await client!.connect(process.env.MONGO_URL!)

      expect(client!.currentClient()).toBeInstanceOf(MongoClient)

      await client!.disconnect()

      expect(client!.currentClient()).toBeUndefined()

      done()
    })
  })

  describe(".currentDb()", () => {
    it("returns the current database", async (done) => {
      expect(client!.currentDb()).toBeUndefined()

      await client!.connect(process.env.MONGO_URL!)

      expect(client!.currentDb()).toBeInstanceOf(Db)

      await client!.disconnect()

      expect(client!.currentDb()).toBeUndefined()

      done()
    })
  })

  describe(".isConnected()", () => {
    it("returns true if connected and false otherwise", async (done) => {
      expect(client!.isConnected()).toEqual(false)

      await client!.connect(process.env.MONGO_URL!)

      expect(client!.isConnected()).toEqual(true)

      await client!.disconnect()

      expect(client!.isConnected()).toEqual(false)

      done()
    })
  })
})
