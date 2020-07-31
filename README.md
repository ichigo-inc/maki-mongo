# 🍣 MakiMongo

MakiMongo is a lightweight wrapper around the [MongoDB](https://www.mongodb.org/) client for Node,
which gives you utilities like validation and batching without the overhead of a full ODM/ORM.

## 🛠 Installation

With npm:

```sh
npm install @movefast-llc/maki-mongo
```

With yarn:

```sh
yarn add @movefast-llc/maki-mongo
```

## 🚀 Quick start

MakiMongo is designed to work best with [TypeScript](https://www.typescriptlang.org/), but it also
works well with plain JavaScript.

With TypeScript:

```typescript
// Zod is used for object schema validation
import * as z from "zod"
import { Document, wrapCollection, connect, disconnect } from "@movefast-llc/maki-mongo"

// MakiMongo works by wrapping each MongoDB collection
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

connect("mongodb://localhost:27017/maki-mongo-basic").then(async () => {
  // Now this call is validated both with TypeScript and at runtime with Zod
  await thingsCollection.createDocument({ name: "one", age: 10 })

  await disconnect()
})
```

Without TypeScript:

```js
const z = require("zod")
const { wrapCollection, connect, disconnect } = require("@movefast-llc/maki-mongo")

// This is the same as the previous example, minus the type definitions
const schema = z.object({
  name: z.string()
})

const thingsCollection = wrapCollection("things", {
  schema,
  indexes: [{ key: { name: 1 } }]
})

connect("mongodb://localhost:27017/maki-mongo-basic").then(async () => {
  // This call is validated at runtime with Zod
  await thingsCollection.createDocument({ name: "one", age: 10 })

  await disconnect()
})
```

## Top-level method overview

```typescript
import MakiMongo from "@movefast-llc/maki-mongo"

// Wraps a collection for use with MakiMongo - see below
MakiMongo.wrapCollection(name, { schema, indexes })
// Connects to a database. This MUST be awaited before you do any database operations
MakiMongo.connect(url)
// Disconnects from the current database
MakiMongo.disconnect()
// Disconnects if connected, then connects to another database
MakiMongo.reconnect(url)
// Returns the current MongoClient if connected
MakiMongo.currentClient()
// Returns the current Db if connected
MakiMongo.currentDb()
// Checks whether a connection has been established yet
MakiMongo.isConnected()
// Creates a new client manager with all the above methods (see "Multiple databases")
MakiMongo.createClient()
```

## Collection method overview

ℹ️ All non-deprecated methods on `Collection` from the MongoDB driver are available on wrapped
collections. See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html

However, since these methods are forwarded straight from the base driver, there's **no validation** -
use the additional methods provided by the wrapper to validate documents.

```typescript
const collection = MakiMongo.wrapCollection(...)

// This kind of thing delegates straight to the MongoDB driver
collection.find(query, options?)
collection.distinct(query, options?)
// ... you get the picture

// These use dataloader to batch queries (anything executed in the same "tick")
// Useful for things like GraphQL resolvers
collection.findById(id)
collection.findById(ids)

// Creates a document *and validates it against the schema*
collection.createDocument(document)

// Updates a document. Simple fields in $set are validated, but complex updates are not
collection.updateDocument(document, { ... })

// Updates a document with full validation
// This works by inserting the updated document into a temporary collection first, so it's much slower the non-validated way
collection.updateDocument(document, { ... }, { fullValidate: true })

// Deletes one or more documents
collection.deleteDocument(document)
collection.deleteDocuments(documents)

// Checks if a document matching the query exists
collection.exists(query)

// Processes documents in batches to avoid loading everything into memory at once
// Useful for data migration scripts and any analysis that can't be done with aggregation
collection.processInBatches({ batchSize?, query?, process })

// Returns the base Collection object, in case you want to do something more low-level
collection.mongoCollection
```

## Multiple databases

You can connect to multiple databases at once by creating multiple client managers with the
`createClient` method.

```typescript
const one = MakiMongo.createClient()
const two = MakiMongo.createClient()

const collectionOne = one.wrapCollection("games")
const collectionTwo = two.wrapCollection("apps")

async function main() {
  await one.connect("http://localhost:27017/games_db")
  await two.connect("http://localhost:27017/apps_db")

  await collectionOne.find() // Run against games_db
  await collectionTwo.find() // Run against apps_db
}
```

## Read more

Check the [Documentation](https://movefast-llc.github.io/maki-mongo) and
[API Reference](https://movefast-llc.github.io/maki-mongo/#/api).

## License

Copyright 2020 MoveFast LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
