import { Collection, ObjectID, IndexSpecification, Db } from "mongodb"
import { object, ZodObject } from "zod"
import syncIndexes from "./indexes/syncIndexes"
import { NotYetConnectedError } from "./errors"
import setupCollectionMethods, { WrappedCollectionMethods } from "./methods/collectionMethods"
import setupDataLoaderMethods, { DataLoaderMethods } from "./methods/dataLoaderMethods"
import setupCustomMethods, { CustomMethods } from "./methods/customMethods"
import { onConnected, onDisconnected, currentDb } from "./connectionStatus"

export interface Document {
  _id: ObjectID
  createdAt: Date
  updatedAt: Date
}

export default function wrapCollection<DocumentType extends Document>(
  collectionName: string,
  {
    schema,
    indexes = []
  }: {
    schema?: ZodObject<any>
    indexes?: IndexSpecification[]
  } = {}
): WrappedCollection<DocumentType> {
  let db: Db | undefined
  let collection: Collection<Readonly<DocumentType>> | undefined = undefined

  onConnected((db) => {
    db = db
    collection = db.collection(collectionName)
    syncIndexes(db, collection, indexes)
  })

  onDisconnected(() => {
    db = undefined
    collection = undefined
  })

  const ensureCollection = (name?: string) => {
    if (!db && currentDb()) {
      db = currentDb()
      collection = db?.collection(collectionName)
    }

    if (!db || !collection) {
      throw new NotYetConnectedError(
        "Not yet connected to MongoDB. Make sure you call and wait for connect() before doing any database operations"
      )
    }

    if (name) {
      return db.collection(name)
    } else {
      return collection
    }
  }

  const collectionMethods = setupCollectionMethods(ensureCollection)
  const dataLoaderMethods = setupDataLoaderMethods(ensureCollection)
  const customMethods = setupCustomMethods(
    ensureCollection,
    schema || object({}),
    dataLoaderMethods.findById
  )

  return {
    ...collectionMethods,
    ...dataLoaderMethods,
    ...customMethods,

    get collection() {
      return collection
    }
  }
}

export type WrappedCollection<DocumentType extends Document = Document> = {
  collection: Collection | undefined
} & CustomMethods<Readonly<DocumentType>> &
  DataLoaderMethods<Readonly<DocumentType>> &
  WrappedCollectionMethods<Readonly<DocumentType>>
