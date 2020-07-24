import { Collection } from "mongodb"
import * as z from "zod"
import useDatabase from "../../support/useDatabase"
import { currentDb, Document } from "../../../src"
import processInBatches from "../../../src/methods/custom/processInBatches"

describe("processInBatches()", () => {
  useDatabase()

  const schema = z.object({
    name: z.string()
  })

  type Item = Document & z.infer<typeof schema>

  let currentCollection: Collection<Item> | undefined = undefined

  beforeEach(async (done) => {
    currentCollection = currentDb()!.collection("tests")

    await currentCollection!.insertMany(
      ["hello", "this", "is", "a", "test"].map((name) => ({
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )

    done()
  })

  it("processes documents in batches", async (done) => {
    const process = jest.fn()

    await processInBatches({
      collection: currentCollection!,
      batchSize: 2,
      process
    })

    expect(process.mock.calls).toMatchObject([
      [[{ name: "hello" }, { name: "this" }]],
      [[{ name: "is" }, { name: "a" }]],
      [[{ name: "test" }]]
    ])

    done()
  })

  it("allows querying and changing batch size", async (done) => {
    const process = jest.fn()

    await processInBatches({
      collection: currentCollection!,
      batchSize: 3,
      query: { $expr: { $gt: [{ $strLenCP: "$name" }, 1] } },
      process
    })

    expect(process.mock.calls).toMatchObject([
      [[{ name: "hello" }, { name: "this" }, { name: "is" }]],
      [[{ name: "test" }]]
    ])

    done()
  })
})
