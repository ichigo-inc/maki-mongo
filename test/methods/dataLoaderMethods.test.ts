import { Collection, ObjectId } from "mongodb"
import * as z from "zod"
import useDatabase from "../support/useDatabase"
import { currentDb, Document } from "../../src"
import setupDataLoaderMethods from "../../src/methods/dataLoaderMethods"

describe("setupDataLoaderMethods()", () => {
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

  describe(".findById()", () => {
    it("finds a document by id", async (done) => {
      const { insertedId } = await currentCollection!.insertOne({
        name: "test",
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const { findById } = setupDataLoaderMethods(() => currentCollection!)

      expect(await findById(insertedId)).toMatchObject({
        name: "test"
      })

      done()
    })

    it("finds nothing with no id", async (done) => {
      await currentCollection!.insertOne({
        name: "test",
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const { findById } = setupDataLoaderMethods(() => currentCollection!)

      expect(await findById(undefined)).toBeUndefined()

      done()
    })
  })

  describe(".findByIds()", () => {
    it("finds ordered documents by ids", async (done) => {
      const { insertedIds } = await currentCollection!.insertMany([
        {
          name: "test1",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "test2",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])

      const { findByIds } = setupDataLoaderMethods(() => currentCollection!)

      expect(await findByIds([insertedIds[1], insertedIds[0]])).toMatchObject([
        { name: "test2" },
        { name: "test1" }
      ])

      done()
    })

    it("finds nothing with no ids", async (done) => {
      await currentCollection!.insertOne({
        name: "test",
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const { findByIds } = setupDataLoaderMethods(() => currentCollection!)

      expect(await findByIds([])).toEqual([])

      done()
    })
  })
})
