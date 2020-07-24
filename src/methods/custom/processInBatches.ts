import { FindOneOptions, FilterQuery, Collection } from "mongodb"
import { Document } from "../../collection"

export default async function processInBatches<DocumentType extends Document>({
  collection,
  batchSize = 1000,
  query = {},
  options,
  process
}: {
  collection: Collection<DocumentType>
  batchSize?: number
  query?: FilterQuery<DocumentType>
  options?: FindOneOptions
  process: (records: DocumentType[]) => void | Promise<void>
}) {
  let skip = 0

  while (true) {
    const records = await collection
      .find(query, options)
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
}
