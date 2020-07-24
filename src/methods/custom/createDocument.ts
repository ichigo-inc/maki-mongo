import {
  UpdateQuery,
  FindOneAndUpdateOption,
  Collection,
  CollectionInsertOneOptions,
  ObjectId
} from "mongodb"
import { ZodObject } from "zod"
import { Document } from "../../collection"

export type AttributesOnCreate<DocumentType extends Document> = Omit<
  DocumentType,
  "_id" | "createdAt" | "updatedAt"
> &
  Partial<Pick<DocumentType, "_id" | "createdAt" | "updatedAt">>

export default async function createDocument<DocumentType extends Document>({
  collection,
  schema,
  document,
  options
}: {
  collection: Collection<DocumentType>
  schema: ZodObject<any>
  document: AttributesOnCreate<DocumentType>
  options?: CollectionInsertOneOptions
}): Promise<ObjectId | undefined> {
  const castDocument = schema.parse(document)

  const result = await collection.insertOne(
    {
      createdAt: document.createdAt || new Date(),
      updatedAt: document.updatedAt || new Date(),
      ...castDocument
    } as any,
    options
  )

  return result.insertedId
}
