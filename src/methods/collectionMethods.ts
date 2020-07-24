import { Collection } from "mongodb"

type WrappedMethods =
  | "find"
  | "aggregate"
  | "countDocuments"
  | "deleteMany"
  | "deleteOne"
  | "findOne"
  | "findOneAndDelete"
  | "findOneAndUpdate"
  | "insertOne"
  | "insertMany"
  | "updateOne"
  | "updateMany"
  | "distinct"

export type WrappedCollectionMethods<T> = Pick<Collection<T>, WrappedMethods>

export default function setupCollectionMethods<T>(
  ensureCollection: () => Collection<T>
): WrappedCollectionMethods<T> {
  const collectionMethod = <Name extends keyof Collection>(name: Name): Collection<T>[Name] => {
    return (...args: Parameters<Collection<T>[Name]>) => {
      return ensureCollection()[name](...args)
    }
  }

  return {
    find: collectionMethod("find"),
    aggregate: collectionMethod("aggregate"),
    countDocuments: collectionMethod("countDocuments"),
    deleteMany: collectionMethod("deleteMany"),
    deleteOne: collectionMethod("deleteOne"),
    findOne: collectionMethod("findOne"),
    findOneAndDelete: collectionMethod("findOneAndDelete"),
    findOneAndUpdate: collectionMethod("findOneAndUpdate"),
    insertOne: collectionMethod("insertOne"),
    insertMany: collectionMethod("insertMany"),
    updateOne: collectionMethod("updateOne"),
    updateMany: collectionMethod("updateMany"),
    distinct: collectionMethod("distinct")
  }
}
