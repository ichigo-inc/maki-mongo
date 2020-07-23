import * as z from "zod"
import { wrapCollection, Document } from "../../../src"

const schema = z.object({
  name: z.string()
})

export type Project = Document & z.infer<typeof schema>

const projectsCollection = wrapCollection<Project>("projects", { schema })

export default projectsCollection
