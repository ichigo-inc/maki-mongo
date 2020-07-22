import { Collection, Db } from 'mongodb'

export default async function collectionExists<T>(db: Db, collection: Collection<T>) {
  const collections = await db.listCollections().toArray()

  return collections.some((other) => other.name === collection.collectionName)
}
