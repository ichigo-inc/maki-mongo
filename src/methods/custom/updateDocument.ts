import { UpdateQuery, FindOneAndUpdateOption, Collection } from "mongodb"
import { ZodObject } from "zod"
import { Document } from "../../collection"

export type UpdateDocumentOptions = FindOneAndUpdateOption & { fullValidate?: boolean }

export default async function updateDocument<DocumentType extends Document>({
  collection,
  temporaryCollection,
  schema,
  document,
  update,
  options
}: {
  collection: Collection<DocumentType>
  temporaryCollection: Collection<any>
  schema: ZodObject<any, any, any>
  document: DocumentType
  update: UpdateQuery<DocumentType>
  options?: UpdateDocumentOptions
}): Promise<DocumentType | undefined> {
  if (options?.fullValidate) {
    const result = await temporaryCollection.findOneAndUpdate(document, update, {
      ...options,
      returnOriginal: false,
      upsert: true
    })

    try {
      const { _id, createdAt, updatedAt, ...document } = result.value
      schema.parse(document)
    } finally {
      await temporaryCollection.deleteOne({ _id: document._id } as any)
    }
  } else if (update.$set) {
    schema.deepPartial().nonstrict().parse(update.$set)
  }

  const result = await collection.findOneAndUpdate(
    { _id: document._id } as any,
    { ...update, $set: { updatedAt: new Date(), ...update.$set } } as any,
    { returnOriginal: false, ...options }
  )

  return result.value
}
