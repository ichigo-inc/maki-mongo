import { ObjectId } from "mongodb"
import { FastifyPluginCallback } from "fastify"
import logLinesCollection from "../collections/logLines"

const logLinesApi: FastifyPluginCallback = (fastify, _, done) => {
  fastify.get<{ Querystring: { projectId?: string } }>("/log-lines", async (request, reply) => {
    const logLines = await logLinesCollection
      .find(request.query.projectId ? { projectId: new ObjectId(request.query.projectId) } : {})
      .toArray()

    reply.send(logLines)
  })

  fastify.get<{ Params: { id: string } }>("/log-lines/:id", async (request, reply) => {
    const logLine = await logLinesCollection.findById(new ObjectId(request.params.id))

    reply.send(logLine)
  })

  fastify.post<{ Body: { projectId: string; message: string } }>(
    "/log-lines",
    async (request, reply) => {
      const logLine = await logLinesCollection.createDocument({
        projectId: new ObjectId(request.body.projectId),
        message: request.body.message,
        occurredAt: new Date()
      })

      reply.send(logLine)
    }
  )

  done()
}

export default logLinesApi
