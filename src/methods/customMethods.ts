import {
  Collection,
  FilterQuery,
  FindOneOptions,
  UpdateQuery,
  ObjectId,
  CollectionInsertOneOptions
} from "mongodb"
import { Document } from "../collection"
import { ZodObject } from "zod"
import updateDocument, { UpdateDocumentOptions } from "./custom/updateDocument"
import createDocument, { AttributesOnCreate } from "./custom/createDocument"
import exists from "./custom/exists"
import processInBatches from "./custom/processInBatches"

export interface CustomMethods<DocumentType extends Document> {
  processInBatches(config: {
    batchSize?: number
    query?: FilterQuery<DocumentType>
    options?: FindOneOptions
    process: (records: DocumentType[]) => Promise<any>
  }): Promise<void>

  exists(query?: FilterQuery<DocumentType>, options?: FindOneOptions): Promise<boolean>

  createDocument(
    document: AttributesOnCreate<DocumentType>,
    options?: CollectionInsertOneOptions
  ): Promise<DocumentType | undefined>

  updateDocument(
    document: DocumentType,
    update: UpdateQuery<DocumentType>,
    options?: UpdateDocumentOptions
  ): Promise<DocumentType | undefined>

  deleteDocument(document: DocumentType): Promise<DocumentType>

  deleteDocuments(documents: DocumentType[]): Promise<DocumentType[]>
}

export default function setupCustomMethods<DocumentType extends Document>(
  ensureCollection: (name?: string) => Collection<DocumentType>,
  schema: ZodObject<any, any, any>,
  findById: (_id: ObjectId) => Promise<DocumentType | undefined>
): CustomMethods<DocumentType> {
  return {
    async processInBatches({ batchSize, query, options, process }) {
      return await processInBatches({
        collection: ensureCollection(),
        batchSize,
        query,
        options,
        process
      })
    },

    async exists(query, options) {
      return await exists({ collection: ensureCollection(), query, options })
    },

    async createDocument(document, options) {
      const insertedId = await createDocument({
        collection: ensureCollection(),
        schema,
        document,
        options
      })

      return insertedId && (await findById(insertedId))
    },

    async updateDocument(document, update, options) {
      return await updateDocument({
        collection: ensureCollection(),
        temporaryCollection: ensureCollection("__makiMongoTemporaryUpdates"),
        schema,
        document,
        update,
        options
      })
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
