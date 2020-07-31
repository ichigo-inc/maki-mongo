import fastify from "fastify"
import logLinesApi from "./api/logLines"
import projectsApi from "./api/projects"
import { connect } from "../../src"

const server = fastify()
server.register(logLinesApi)
server.register(projectsApi)

const port = parseInt(process.env.PORT || "8080")

connect("mongodb://localhost:27017/maki-mongo-log-aggregator").then(() => {
  server.listen(port, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    console.log(`Listening on localhost:${port}`)
  })
})
