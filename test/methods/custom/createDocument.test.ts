import { Collection, ObjectId } from "mongodb"
import * as z from "zod"
import useDatabase from "../../support/useDatabase"
import { currentDb, Document } from "../../../src"
import createDocument from "../../../src/methods/custom/createDocument"

describe("connect()", () => {
  useDatabase()

  const schema = z.object({
    name: z.string(),
    items: z.array(z.string())
  })

  type Item = Document & z.infer<typeof schema>

  let currentCollection: Collection<Item> | undefined = undefined

  beforeEach(async (done) => {
    currentCollection = currentDb()!.collection("tests")

    done()
  })

  it("creates a document", async (done) => {
    const id = await createDocument({
      collection: currentCollection!,
      schema,
      document: {
        name: "hello",
        items: ["world"]
      }
    })

    expect(id).toBeInstanceOf(ObjectId)
    expect(await currentCollection!.findOne({ _id: id })).toMatchObject({
      name: "hello",
      items: ["world"]
    })

    done()
  })

  it("sets createdAt and updatedAt", async (done) => {
    const id = await createDocument({
      collection: currentCollection!,
      schema,
      document: {
        name: "hello",
        items: ["world"]
      }
    })

    expect(id).toBeInstanceOf(ObjectId)
    expect(await currentCollection!.findOne({ _id: id })).toMatchObject({
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    })

    done()
  })

  it("validates the document with the schema", async (done) => {
    await expect(
      createDocument({
        collection: currentCollection!,
        schema,
        document: { name: "hello" } as any
      })
    ).rejects.toMatchObject({
      message: expect.stringMatching(/invalid_type/)
    })

    done()
  })
})
