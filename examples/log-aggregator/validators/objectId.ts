import { mixed } from "yup"
import { ObjectId } from "mongodb"

const objectId = () =>
  mixed<ObjectId>()
    .transform((value) => value && new ObjectId(value))
    .test(
      "isObjectId",
      ({ path }) => `${path} must be an ObjectId`,
      (value) => (value ? value instanceof ObjectId : true)
    )

export default objectId
