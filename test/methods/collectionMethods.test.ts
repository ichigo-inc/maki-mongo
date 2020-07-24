import { Collection } from "mongodb"
import * as z from "zod"
import useDatabase from "../support/useDatabase"
import { currentDb, Document } from "../../src"
import setupCollectionMethods from "../../src/methods/collectionMethods"

describe("setupCollectionMethods()", () => {
  useDatabase()

  const schema = z.object({
    name: z.string()
  })

  type Item = Document & z.infer<typeof schema>

  let currentCollection: Collection<Item> | undefined = undefined

  beforeEach(async (done) => {
    currentCollection = currentDb()!.collection("tests")

    done()
  })

  it("delegates methods to the collection", async (done) => {
    await currentCollection!.insertOne({
      name: "test",
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const collectionMethods = setupCollectionMethods(() => currentCollection!)

    expect(await collectionMethods.find().toArray()).toMatchObject([
      {
        name: "test"
      }
    ])

    done()
  })
})
