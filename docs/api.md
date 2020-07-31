## Top-level exports

Note: The default export is a `caramon` object with these methods, but the methods are also exported
as named exports, so any kind of import/require/etc should just work.

### createClient

`createClient()`

Creates a new `Client` manager. This can be used to connect to multiple databases simultaneously.

Example:

```typescript
import caramon from "@movefast-llc/caramon"

const one = caramon.createClient()
const two = caramon.createClient()

const collectionOne = one.wrapCollection("games")
const collectionTwo = two.wrapCollection("apps")

async function main() {
  await one.connect("http://localhost:27017/games_db")
  await two.connect("http://localhost:27017/apps_db")

  await collectionOne.find() // Run against games_db
  await collectionTwo.find() // Run against apps_db
}
```

### (all Client methods)

Caramon creates a default client for you and exposes all the methods directly, saving you the
hassle of calling `createClient` if you only need to connect to one database.

For example, you can directly `import { wrapCollection, connect } from "@movefast-llc/caramon"`

See below.

## Client

### wrapCollection

`wrapCollection<DocumentType>(name, { schema?, indexes? })`

Wraps a collection for use with caramon and returns the `WrappedCollection`

- `name` is the name of the collection in MongoDB
- `schema` is an optional Zod schema describing the type of documents to be stored in this collection. It's expected not to include the `_id` field; this is added by Caramon automatically
- `indexes` is an optional list of indexes to have on the collection. These will be synced to the collection during the connection process. See https://docs.mongodb.com/manual/reference/command/createIndexes/

Example:

```typescript
const schema = z.object({
  name: z.string()
})

type Thing = Document & z.infer<typeof schema>

const thingsCollection = wrapCollection<Thing>("things", {
  schema,
  // Indexes will be created (if they don't exist) during the connection process
  indexes: [{ key: { name: 1 } }]
})
```

### connect

`connect(url)`

Connects to a database. This MUST be awaited before you do any database operations

### disconnect

`disconnect()`

Disconnects from the current database

### reconnect

`reconnect(url)`

Disconnects if connected, then connects to another database

### currentClient

`currentClient()`

Returns the current MongoClient if connected

### currentDb

`currentDb()`

Returns the current Db if connected

### isConnected

`isConnected()`

Checks whether a connection has been established yet

## WrappedCollection

### findById

`findById(id)`

This uses dataloader to batch queries (anything executed in the same "tick"). Useful for things like GraphQL resolvers.

### findByIds

`findByIds(ids)`

This uses dataloader to batch queries (anything executed in the same "tick"). Useful for things like GraphQL resolvers.

### createDocument

`createDocument(document)`

Creates a document _and validates it against the schema_

### updateDocument

`updateDocument(document, updates, { fullValidate?, ...options })`

Updates a document. If `fullValidate` is true, the document is validated fully (this works by
inserting the updated document into a temporary collection first, so it's much slower the
non-validated way). If not, simple fields in `$set` are validated, but any other updates are not.

### deleteDocument

`deleteDocument(document)`

### deleteDocuments

`deleteDocuments(documents)`

Deletes one or more documents from the collection.

### exists

`exists(query?)`

Checks if a document matching the query exists. Returns a `Promise<boolean>` which resolves to `true`
if a matching document exists and `false` otherwise.

Example:

```typescript
await collection.exists({ name: "Caramon" })
```

### processInBatches

`processInBatches(options: { batchSize?, query?, process })`

Processes documents in batches to avoid loading everything into memory at once.
Useful for data migration scripts and any analysis that can't be done with aggregation.

- `batchSize` (default: `1000`) determines the number of documents to return on each iteration
- `query` (default: `{}`) allows filtering the documents in the collection before batching them
- `process` is the function to call on each iteration. It takes one argument, a list of document objects from this interation

Example:

```typescript
// Assuming collection is a collection with 4,500 documents
await collection.processInBatches({
  batchSize: 1000,
  process: (documents) => console.log(documents.length)
})
// Logs: 1000, 1000, 1000, 1000, 500
```

### mongoCollection

Returns the base Collection object, in case you want to do something more low-level.

### MongoDB collection methods

#### collectionName

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#collectionName

#### namespace

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#namespace

#### writeConcern

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#writeConcern

#### readConcern

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#readConcern

#### hint

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#hint

#### aggregate

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#aggregate

#### bulkWrite

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#bulkWrite

#### countDocuments

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#countDocuments

#### createIndex

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#createIndex

#### createIndexes

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#createIndexes

#### deleteMany

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#deleteMany

#### deleteOne

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#deleteOne

#### distinct

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#distinct

#### drop

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#drop

#### dropIndex

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#dropIndex

#### dropIndexes

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#dropIndexes

#### estimatedDocumentCount

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#estimatedDocumentCount

#### find

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#find

#### findOne

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#findOne

#### findOneAndDelete

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#findOneAndDelete

#### findOneAndReplace

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#findOneAndReplace

#### findOneAndUpdate

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#findOneAndUpdate

#### geoHaystackSearch

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#geoHaystackSearch

#### indexes

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#indexes

#### indexExists

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#indexExists

#### indexInformation

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#indexInformation

#### initializeOrderedBulkOp

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#initializeOrderedBulkOp

#### initializeUnorderedBulkOp

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#initializeUnorderedBulkOp

#### insertOne

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#insertOne

#### insertMany

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#insertMany

#### isCapped

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#isCapped

#### listIndexes

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#listIndexes

#### mapReduce

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#mapReduce

#### options

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#options

#### parallelCollectionScan

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#parallelCollectionScan

#### reIndex

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#reIndex

#### rename

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#rename

#### replaceOne

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#replaceOne

#### stats

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#stats

#### updateOne

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#updateOne

#### updateMany

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#updateMany

#### watch

See http://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#watch
