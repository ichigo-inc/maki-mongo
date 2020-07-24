import { Collection } from "mongodb"
import * as z from "zod"
import useDatabase from "../../support/useDatabase"
import { currentDb, Document } from "../../../src"
import updateDocument from "../../../src/methods/custom/updateDocument"

describe("connect()", () => {
  useDatabase()

  const schema = z.object({
    name: z.string(),
    items: z.array(z.string())
  })

  type Item = Document & z.infer<typeof schema>

  let currentCollection: Collection<Item> | undefined = undefined
  let temporaryCollection: Collection<any> | undefined = undefined
  let item: Item | undefined = undefined

  beforeEach(async (done) => {
    currentCollection = currentDb()!.collection("tests")
    temporaryCollection = currentDb()!.collection("tmp")

    await currentCollection!.insertOne({
      name: "hello",
      items: ["one", "two"],
      createdAt: new Date(),
      updatedAt: new Date()
    })

    item = (await currentCollection!.findOne({})) as Item

    done()
  })

  it("updates a document", async (done) => {
    await updateDocument({
      collection: currentCollection!,
      temporaryCollection: temporaryCollection!,
      schema,
      document: item!,
      update: { $set: { name: "world" } }
    })

    expect(await currentCollection!.findOne({})).toMatchObject({
      name: "world"
    })

    done()
  })

  it("sets updatedAt", async (done) => {
    await updateDocument({
      collection: currentCollection!,
      temporaryCollection: temporaryCollection!,
      schema,
      document: item!,
      update: { $set: { name: "world" } }
    })

    const updatedDocument = await currentCollection!.findOne({})

    expect(updatedDocument!.updatedAt.getTime()).toBeGreaterThan(
      updatedDocument!.createdAt.getTime()
    )

    done()
  })

  it("validates the document with the partial-ified schema", async (done) => {
    await expect(
      updateDocument({
        collection: currentCollection!,
        temporaryCollection: temporaryCollection!,
        schema,
        document: item!,
        update: { $set: { name: 1 } } as any
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/Invalid input/)
    })

    done()
  })

  it("does not validate additional keys", async (done) => {
    await updateDocument({
      collection: currentCollection!,
      temporaryCollection: temporaryCollection!,
      schema,
      document: item!,
      update: { $set: { description: "bla", "items.0": 1 } }
    })

    expect(await currentCollection!.findOne({})).toMatchObject({
      description: "bla",
      items: [1, "two"]
    })

    done()
  })

  it("does not validate operations other than $set", async (done) => {
    await updateDocument({
      collection: currentCollection!,
      temporaryCollection: temporaryCollection!,
      schema,
      document: item!,
      update: { $push: { items: 3 } } as any
    })

    expect(await currentCollection!.findOne({})).toMatchObject({
      items: ["one", "two", 3]
    })

    done()
  })

  describe("when fullValidation is on", () => {
    it("validates additional keys", async (done) => {
      await expect(
        updateDocument({
          collection: currentCollection!,
          temporaryCollection: temporaryCollection!,
          schema,
          document: item!,
          update: { $set: { description: "bla", "items.0": 1 } },
          options: { fullValidate: true }
        })
      ).rejects.toMatchObject({
        message: expect.stringMatching(/unrecognized_keys/)
      })

      expect(await currentCollection!.findOne({})).toEqual(item)

      done()
    })

    it("validates operations other than $set", async (done) => {
      await expect(
        updateDocument({
          collection: currentCollection!,
          temporaryCollection: temporaryCollection!,
          schema,
          document: item!,
          update: { $push: { items: 3 } } as any,
          options: { fullValidate: true }
        })
      ).rejects.toMatchObject({
        message: expect.stringMatching(/invalid_type/)
      })

      done()
    })

    it("validates additional keys", async (done) => {
      await expect(
        updateDocument({
          collection: currentCollection!,
          temporaryCollection: temporaryCollection!,
          schema,
          document: item!,
          update: { $set: { description: "bla", "items.0": 1 } },
          options: { fullValidate: true }
        })
      ).rejects.toMatchObject({
        message: expect.stringMatching(/unrecognized_keys/)
      })

      done()
    })

    it("does not leave leftover documents in the temporary collection", async (done) => {
      try {
        await updateDocument({
          collection: currentCollection!,
          temporaryCollection: temporaryCollection!,
          schema,
          document: item!,
          update: { $push: { items: 3 } } as any,
          options: { fullValidate: true }
        })
      } catch (e) {}

      expect(await temporaryCollection!.findOne({})).toBeNull()

      done()
    })
  })
})
