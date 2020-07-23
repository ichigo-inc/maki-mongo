import { Collection, ObjectID, IndexSpecification } from "mongodb"
import { object, ZodObject } from "zod"
import syncIndexes from "./indexes/syncIndexes"
import { onConnected, onDisconnected } from "./connectionStatus"
import { NotYetConnectedError } from "./errors"
import setupCollectionMethods, { WrappedCollectionMethods } from "./methods/collectionMethods"
import setupDataLoaderMethods, { DataLoaderMethods } from "./methods/dataLoaderMethods"
import setupCustomMethods, { CustomMethods } from "./methods/customMethods"

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
  let collection: Collection<Readonly<DocumentType>> | undefined = undefined

  onConnected((db) => {
    collection = db.collection(collectionName)
    syncIndexes(db, collection, indexes)
  })
  onDisconnected(() => (collection = undefined))

  const ensureCollection = () => {
    if (!collection) {
      throw new NotYetConnectedError(
        "Not yet connected to MongoDB. Make sure you call and wait for connect() before doing any database operations"
      )
    }

    return collection
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

export type WrappedCollection<DocumentType extends Document> = {
  collection: Collection | undefined
} & CustomMethods<Readonly<DocumentType>> &
  DataLoaderMethods<Readonly<DocumentType>> &
  WrappedCollectionMethods<Readonly<DocumentType>>
