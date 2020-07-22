import { Collection, ObjectId } from "mongodb"
import DataLoader from "dataloader"
import { Document } from "../collection"

export interface DataLoaderMethods<T> {
  findById(_id?: ObjectId): Promise<T | undefined>

  findByIds(_ids: (ObjectId | undefined)[]): Promise<(T | Error | undefined)[]>
}

export default function setupDataLoaderMethods<T extends Document>(
  ensureCollection: () => Collection<T>
): DataLoaderMethods<T> {
  const loadData = async (ids: ReadonlyArray<ObjectId | undefined>) => {
    const documents = await ensureCollection()
      .find({ _id: { $in: ids } } as any)
      .toArray()

    return ids.map((id) => id && documents.find((document) => document._id.equals(id)))
  }

  const dataLoader = new DataLoader(loadData, {
    cache: false
  })

  return {
    async findById(id) {
      if (id) {
        return dataLoader.load(id)
      }
    },

    async findByIds(ids) {
      return dataLoader.loadMany(ids || [])
    }
  }
}
