import { Collection, IndexSpecification, Db } from "mongodb"
import isEqual from "lodash.isequal"
import collectionExists from "./collectionExists"
import debug from "../debug"

export default async function syncIndexes<T>(
  db: Db,
  collection: Collection<T>,
  indexes: IndexSpecification[]
) {
  await removeUnspecifiedIndexes(db, collection, indexes)

  if (indexes.length) {
    indexes.forEach((index) => debug(`Creating index on ${collection.collectionName}:`, index))

    await collection.createIndexes(indexes.map((index) => ({ ...index, background: true })))
  }
}

async function removeUnspecifiedIndexes<T>(
  db: Db,
  collection: Collection<T>,
  indexes: IndexSpecification[]
) {
  if (!(await collectionExists(db, collection))) {
    return
  }

  const existingIndexes = await collection.indexes()

  const isSubset = (partial: any, whole: any): boolean => {
    if (typeof partial === "object") {
      return Object.keys(partial).every((key) => isSubset(partial[key], whole?.[key]))
    }

    return isEqual(partial, whole)
  }

  const removedIndexes = existingIndexes.filter(
    (index: any) =>
      !isEqual(index.key, { _id: 1 }) && !indexes.some((newIndex) => isSubset(newIndex, index))
  )

  await Promise.all(
    removedIndexes.map(async (index: any) => {
      debug(`Dropping index on ${collection.collectionName}:`, index)
      await collection.dropIndex(index.name)
    })
  )
}
