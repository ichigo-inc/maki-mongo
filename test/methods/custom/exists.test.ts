import { Collection, ObjectId } from "mongodb"
import * as z from "zod"
import useDatabase from "../../support/useDatabase"
import { currentDb, Document } from "../../../src"
import createDocument from "../../../src/methods/custom/createDocument"
import exists from "../../../src/methods/custom/exists"

describe("exists()", () => {
  useDatabase()

  const schema = z.object({
    name: z.string()
  })

  type Item = Document & z.infer<typeof schema>

  let currentCollection: Collection<Item> | undefined = undefined

  beforeEach(async (done) => {
    currentCollection = currentDb()!.collection("tests")

    await currentCollection!.insertOne({
      name: "hello",
      createdAt: new Date(),
      updatedAt: new Date()
    })

    done()
  })

  it("returns true if a matching document exists", async (done) => {
    expect(await exists({ collection: currentCollection!, query: { name: "hello" } })).toEqual(true)

    done()
  })

  it("returns false if no matching document exists", async (done) => {
    expect(await exists({ collection: currentCollection!, query: { name: "h" } })).toEqual(false)

    done()
  })
})
