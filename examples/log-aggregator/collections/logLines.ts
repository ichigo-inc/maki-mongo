import { wrapCollection, Document } from "../../../src"
import objectId from "../validators/objectId"
import { object, InferType, string, date } from "yup"

const schema = object().required().shape({
  projectId: objectId().required(),
  occurredAt: date().required(),
  message: string().required()
})

export type LogLine = Document & InferType<typeof schema>

const logLinesCollection = wrapCollection<LogLine>("log-lines", {
  schema,
  indexes: [{ key: { projectId: 1 } }, { key: { occurredAt: 1 } }]
})

export default logLinesCollection
