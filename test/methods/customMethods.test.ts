import { Collection, ObjectId } from "mongodb"
import * as z from "zod"
import useDatabase from "../support/useDatabase"
import { currentDb, Document } from "../../src"
import setupCustomMethods from "../../src/methods/customMethods"

describe("setupCustomMethods()", () => {
  useDatabase()

  const schema = z.object({
    name: z.string()
  })

  type Item = Document & z.infer<typeof schema>

  let currentCollection: Collection<Item> | undefined = undefined

  const findOne = async (_id?: ObjectId) => (await currentCollection?.findOne({ _id })) || undefined

  beforeEach(async (done) => {
    currentCollection = currentDb()!.collection("tests")

    done()
  })

  describe(".processInBatches()", () => {
    it("processes documents", async (done) => {
      await currentCollection!.insertOne({
        name: "test",
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const processor = jest.fn()

      const { processInBatches } = setupCustomMethods((_) => currentCollection!, schema, findOne)

      await processInBatches({ process: processor })

      expect(processor.mock.calls).toMatchObject([[[{ name: "test" }]]])

      done()
    })
  })

  describe(".exists()", () => {
    it("checks existence", async (done) => {
      const { exists } = setupCustomMethods((_) => currentCollection!, schema, findOne)

      expect(await exists()).toEqual(false)

      done()
    })
  })

  describe(".createDocument()", () => {
    it("creates a document", async (done) => {
      const { createDocument } = setupCustomMethods((_) => currentCollection!, schema, findOne)

      expect(await createDocument({ name: "test" })).toMatchObject({
        _id: expect.any(ObjectId),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        name: "test"
      })

      done()
    })
  })

  describe(".updateDocument()", () => {
    it("updates a document", async (done) => {
      await currentCollection!.insertOne({
        name: "test",
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const item = (await currentCollection!.findOne({})) as Item

      const { updateDocument } = setupCustomMethods((_) => currentCollection!, schema, findOne)

      const updated = await updateDocument(item, { $set: { name: "test2" } })

      expect(updated).toMatchObject({ name: "test2" })

      done()
    })
  })

  describe(".deleteDocument()", () => {
    it("deletes a document", async (done) => {
      await currentCollection!.insertOne({
        name: "test",
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const item = (await currentCollection!.findOne({})) as Item

      const { deleteDocument } = setupCustomMethods((_) => currentCollection!, schema, findOne)

      const deleted = await deleteDocument(item)

      expect(deleted).toMatchObject({ name: "test" })
      expect(await currentCollection!.countDocuments()).toEqual(0)

      done()
    })
  })

  describe(".deleteDocument()", () => {
    it("deletes documents", async (done) => {
      await currentCollection!.insertOne({
        name: "test",
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const item = (await currentCollection!.findOne({})) as Item

      const { deleteDocuments } = setupCustomMethods((_) => currentCollection!, schema, findOne)

      const deleted = await deleteDocuments([item])

      expect(deleted).toMatchObject([{ name: "test" }])
      expect(await currentCollection!.countDocuments()).toEqual(0)

      done()
    })
  })
})
