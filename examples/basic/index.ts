import { wrapCollection, Document, connect, disconnect } from "../../src"
import { object, InferType, string } from "yup"

const schema = object().required().shape({
  name: string().required()
})

export type Thing = Document & InferType<typeof schema>

const thingsCollection = wrapCollection<Thing>("things", { schema })

connect("mongodb://localhost:27017/caramon-basic").then(async () => {
  await thingsCollection.deleteMany({})
  console.log("Deleted all the things")

  const thing1 = await thingsCollection.createDocument({ name: "one" })
  const thing2 = await thingsCollection.createDocument({ name: "two" })
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
