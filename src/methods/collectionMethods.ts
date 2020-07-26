import { Collection } from "mongodb"

type WrappedMethods =
  | "aggregate"
  | "bulkWrite"
  | "countDocuments"
  | "createIndex"
  | "createIndexes"
  | "deleteMany"
  | "deleteOne"
  | "distinct"
  | "drop"
  | "dropIndex"
  | "dropIndexes"
  | "estimatedDocumentCount"
  | "find"
  | "findOne"
  | "findOneAndDelete"
  | "findOneAndReplace"
  | "findOneAndUpdate"
  | "geoHaystackSearch"
  | "indexes"
  | "indexExists"
  | "indexInformation"
  | "initializeOrderedBulkOp"
  | "initializeUnorderedBulkOp"
  | "insertOne"
  | "insertMany"
  | "isCapped"
  | "listIndexes"
  | "mapReduce"
  | "options"
  | "parallelCollectionScan"
  | "reIndex"
  | "rename"
  | "replaceOne"
  | "stats"
  | "updateOne"
  | "updateMany"
  | "watch"

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
    aggregate: collectionMethod("aggregate"),
    bulkWrite: collectionMethod("bulkWrite"),
    countDocuments: collectionMethod("countDocuments"),
    createIndex: collectionMethod("createIndex"),
    createIndexes: collectionMethod("createIndexes"),
    deleteMany: collectionMethod("deleteMany"),
    deleteOne: collectionMethod("deleteOne"),
    distinct: collectionMethod("distinct"),
    drop: collectionMethod("drop"),
    dropIndex: collectionMethod("dropIndex"),
    dropIndexes: collectionMethod("dropIndexes"),
    estimatedDocumentCount: collectionMethod("estimatedDocumentCount"),
    find: collectionMethod("find"),
    findOne: collectionMethod("findOne"),
    findOneAndDelete: collectionMethod("findOneAndDelete"),
    findOneAndReplace: collectionMethod("findOneAndReplace"),
    findOneAndUpdate: collectionMethod("findOneAndUpdate"),
    geoHaystackSearch: collectionMethod("geoHaystackSearch"),
    indexes: collectionMethod("indexes"),
    indexExists: collectionMethod("indexExists"),
    indexInformation: collectionMethod("indexInformation"),
    initializeOrderedBulkOp: collectionMethod("initializeOrderedBulkOp"),
    initializeUnorderedBulkOp: collectionMethod("initializeUnorderedBulkOp"),
    insertOne: collectionMethod("insertOne"),
    insertMany: collectionMethod("insertMany"),
    isCapped: collectionMethod("isCapped"),
    listIndexes: collectionMethod("listIndexes"),
    mapReduce: collectionMethod("mapReduce"),
    options: collectionMethod("options"),
    parallelCollectionScan: collectionMethod("parallelCollectionScan"),
    reIndex: collectionMethod("reIndex"),
    rename: collectionMethod("rename"),
    replaceOne: collectionMethod("replaceOne"),
    stats: collectionMethod("stats"),
    updateOne: collectionMethod("updateOne"),
    updateMany: collectionMethod("updateMany"),
    watch: collectionMethod("watch")
  }
}
