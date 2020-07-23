import * as z from "zod"
import { ObjectId } from "mongodb"

const objectId = () =>
  z
    .instanceof(ObjectId)
    .refine((value) => (value ? value instanceof ObjectId : true), {
      message: "must be an ObjectId"
    })

export default objectId
