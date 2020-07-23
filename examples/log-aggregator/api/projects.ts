import { FastifyPluginCallback } from "fastify"
import projectsCollection from "../collections/projects"

const projectsApi: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get("/projects", async (_request, reply) => {
    const projects = await projectsCollection.find().toArray()

    reply.send(projects)
  })

  fastify.post<{ Body: { name: string } }>("/projects", async (request, reply) => {
    const project = await projectsCollection.createDocument({ name: request.body.name })

    reply.send(project)
  })

  done()
}

export default projectsApi
