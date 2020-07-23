import * as z from "zod"
import { wrapCollection, Document } from "../../../src"
import objectId from "../validators/objectId"

const schema = z.object({
  projectId: objectId(),
  occurredAt: z.date(),
  message: z.string()
})

export type LogLine = Document & z.infer<typeof schema>

const logLinesCollection = wrapCollection<LogLine>("log-lines", {
  schema,
  indexes: [{ key: { projectId: 1 } }, { key: { occurredAt: 1 } }]
})

export default logLinesCollection
