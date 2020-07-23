import { wrapCollection, Document } from "../../../src"
import { object, InferType, string } from "yup"

const schema = object().required().shape({
  name: string().required()
})

export type Project = Document & InferType<typeof schema>

const projectsCollection = wrapCollection<Project>("projects", { schema })

export default projectsCollection
