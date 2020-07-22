import {
  Collection,
  FilterQuery,
  FindOneOptions,
  UpdateQuery,
  FindOneAndUpdateOption,
  ObjectId
} from "mongodb"
import { Document } from "../collection"
import { Schema } from "yup"

export type AttributesOnCreate<DocumentType extends Document> = Omit<
  DocumentType,
  "_id" | "createdAt" | "updatedAt"
> &
  Partial<Pick<DocumentType, "_id" | "createdAt" | "updatedAt">>

export interface CustomMethods<DocumentType extends Document> {
  processInBatches(config: {
    batchSize?: number
    query?: FilterQuery<DocumentType>
    process: (records: DocumentType[]) => Promise<any>
  }): Promise<void>

  exists(query?: FilterQuery<DocumentType>, options?: FindOneOptions): Promise<boolean>

  createDocument(document: AttributesOnCreate<DocumentType>): Promise<DocumentType | undefined>

  updateDocument(
    document: DocumentType,
    update: UpdateQuery<DocumentType>,
    options?: FindOneAndUpdateOption
  ): Promise<DocumentType | undefined>

  deleteDocument(document: DocumentType): Promise<DocumentType>

  deleteDocuments(documents: DocumentType[]): Promise<DocumentType[]>
}

export default function setupCustomMethods<DocumentType extends Document>(
  ensureCollection: () => Collection<DocumentType>,
  schema: Schema<any>,
  findById: (_id: ObjectId) => Promise<DocumentType | undefined>
): CustomMethods<DocumentType> {
  return {
    async processInBatches({ batchSize = 1000, query = {}, process }) {
      const collection = ensureCollection()
      let skip = 0

      while (true) {
        const records = await collection
          .find(query)
          .sort({ _id: 1 })
          .limit(batchSize)
          .skip(skip)
          .toArray()

        if (!records.length) {
          break
        }

        await process(records)
        skip += records.length
      }
    },

    async exists(query, options) {
      const collection = ensureCollection()
      const foundCount = await collection
        .find(query || {}, options)
        .limit(1)
        .count()

      return foundCount > 0
    },

    async createDocument(document) {
      const castDocument = await schema.validate(document)

      const collection = ensureCollection()

      const result = await collection.insertOne({
        createdAt: document.createdAt || new Date(),
        updatedAt: document.updatedAt || new Date(),
        ...castDocument
      } as any)

      return await findById(result.insertedId)
    },

    async updateDocument(document, update, options) {
      const result = await ensureCollection().findOneAndUpdate(
        { _id: document._id } as any,
        { ...update, $set: { updatedAt: new Date(), ...update.$set } } as any,
        { returnOriginal: false, ...options }
      )

      return result.value
    },

    async deleteDocument(document) {
      ensureCollection().deleteOne({ _id: document._id } as any)
      return document
    },

    async deleteDocuments(documents) {
      ensureCollection().deleteMany({
        _id: { $in: documents.map((document) => document._id) }
      } as any)
      return documents
    }
  }
}
