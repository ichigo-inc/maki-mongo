# 🍮 Caramon

Caramon is a lightweight wrapper around the [MongoDB](https://www.mongodb.org/) client for Node,
which gives you utilities like validation and batching without the overhead of a full ODM/ORM.

## Features

- Static and runtime validation with [Zod](https://github.com/vriad/zod)
- Load related documents efficiently with [Dataloader](https://github.com/graphql/dataloader)
- Simplify data migrations with batch processing
- Mix and match plain MongoDB methods and convenient helpers
- It's fast! 🏎 Hardly any overhead compared to an ORM like Mongoose

## Installation

With npm:

```sh
npm install @movefast-llc/caramon
```

With yarn:

```sh
yarn add @movefast-llc/caramon
```

## Quick start

Caramon is designed to work best with [TypeScript](https://www.typescriptlang.org/), but it also
works well with plain JavaScript.

<!-- tabs:start -->

#### **TypeScript**

```typescript
// Zod is used for object schema validation
import * as z from "zod"
import { Document, wrapCollection, connect, disconnect } from "@movefast-llc/caramon"

// Caramon works by wrapping each MongoDB collection
// First, this is the basic schema which documents in this collection are expected to follow
const schema = z.object({
  name: z.string()
})

// Next, we define the TypeScript definition of what this collection contains
// Note that Document provides _id, createdAt and updatedAt fields so the schema doesn't need to include these
type Thing = Document & z.infer<typeof schema>

// Now we wrap the collection, passing in the type and the schema
const thingsCollection = wrapCollection<Thing>("things", {
  schema,
  // Indexes will be created (if they don't exist) during the connection process
  indexes: [{ key: { name: 1 } }]
})

connect("mongodb://localhost:27017/caramon-basic").then(async () => {
  // Now this call is validated both with TypeScript and at runtime with Zod
  await thingsCollection.createDocument({ name: "one", age: 10 })

  await disconnect()
})
```

#### **JavaScript**

```js
const z = require("zod")
const { wrapCollection, connect, disconnect } = require("@movefast-llc/caramon")

// This is the same as the previous example, minus the type definitions
const schema = z.object({
  name: z.string()
})

const thingsCollection = wrapCollection("things", {
  schema,
  indexes: [{ key: { name: 1 } }]
})

connect("mongodb://localhost:27017/caramon-basic").then(async () => {
  // This call is validated at runtime with Zod
  await thingsCollection.createDocument({ name: "one", age: 10 })

  await disconnect()
})
```

<!-- tabs:end -->

## Examples

- [Basic](https://github.com/movefast-llc/caramon/tree/master/examples/basic)
- [Log Aggregator](https://github.com/movefast-llc/caramon/tree/master/examples/log-aggregator)

## API docs

[View the API docs here](/api)
