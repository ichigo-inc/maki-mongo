import * as z from "zod"
import { wrapCollection, Document, connect, disconnect } from "../../src"

const schema = z.object({
  name: z.string(),
  age: z.number()
})

export type Thing = Document & z.infer<typeof schema>

const thingsCollection = wrapCollection<Thing>("things", { schema })

connect("mongodb://localhost:27017/maki-mongo-basic").then(async () => {
  await thingsCollection.deleteMany({})
  console.log("Deleted all the things")

  const thing1 = await thingsCollection.createDocument({ name: "one", age: 10 })
  const thing2 = await thingsCollection.createDocument({ name: "two", age: 10 })
  console.log("Created things:", [thing1, thing2])
  console.log(
    "Reloading from the database returns:",
    await thingsCollection.findByIds([thing1!._id, thing2!._id])
  )

  const thing1Updated = await thingsCollection.updateDocument(thing1!, {
    $set: { name: "different one" }
  })
  console.log("Updated thing 1 to:", thing1Updated)
  console.log("Reloading from the database returns:", await thingsCollection.findById(thing1!._id))
  console.log("But the original variable is immutable and unchanged:", thing1)

  await disconnect()
})
