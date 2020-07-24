import { Document } from "../../collection"
import { Collection, FilterQuery, FindOneOptions } from "mongodb"

export default async function exists<DocumentType extends Document>({
  collection,
  query,
  options
}: {
  collection: Collection<DocumentType>
  query?: FilterQuery<DocumentType>
  options?: FindOneOptions
}) {
  const foundCount = await collection
    .find(query || {}, options)
    .limit(1)
    .count()

  return foundCount > 0
}
