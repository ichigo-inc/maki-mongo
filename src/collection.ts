import { Collection, ObjectID, Db, IndexSpecification } from "mongodb"
import * as z from "zod"
import syncIndexes from "./indexes/syncIndexes"
import { NotYetConnectedError } from "./errors"
import setupCollectionMethods, { WrappedCollectionMethods } from "./methods/collectionMethods"
import setupDataLoaderMethods, { DataLoaderMethods } from "./methods/dataLoaderMethods"
import setupCustomMethods, { CustomMethods } from "./methods/customMethods"

export interface Document {
  _id: ObjectID
  createdAt: Date
  updatedAt: Date
}

export default function setupCollectionWrapper({
  onConnected,
  onDisconnected
}: {
  onConnected: (callback: (db: Db) => void) => void
  onDisconnected: (callback: () => void) => void
}) {
  return function wrapCollection<DocumentType extends Document>(
    collectionName: string,
    {
      schema,
      indexes = []
    }: {
      schema?: z.ZodObject<any>
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
      schema || z.object({}),
      dataLoaderMethods.findById
    )

    return {
      get mongoCollection() {
        return collection
      },

      get collectionName() {
        return ensureCollection().collectionName
      },

      get namespace() {
        return ensureCollection().namespace
      },

      get writeConcern() {
        return ensureCollection().writeConcern
      },

      get readConcern() {
        return ensureCollection().readConcern
      },

      get hint() {
        return ensureCollection().hint
      },

      ...collectionMethods,
      ...dataLoaderMethods,
      ...customMethods
    }
  }
}

type WrappedValues = "collectionName" | "namespace" | "writeConcern" | "readConcern" | "hint"

export type WrappedCollection<DocumentType extends Document = Document> = {
  mongoCollection: Collection | undefined
} & CustomMethods<Readonly<DocumentType>> &
  DataLoaderMethods<Readonly<DocumentType>> &
  WrappedCollectionMethods<Readonly<DocumentType>> &
  Pick<Collection<DocumentType>, WrappedValues>
