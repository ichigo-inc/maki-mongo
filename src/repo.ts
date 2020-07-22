import {
  MongoClient,
  Collection,
  ObjectID,
  UpdateQuery,
  IndexSpecification,
  FilterQuery,
  CollectionAggregationOptions,
  Db,
  FindOneOptions,
  FindOneAndUpdateOption
} from 'mongodb'
import DataLoader from 'dataloader'
import yup from 'yup'
import syncIndexes from './repo/syncIndexes'

export interface Document {
  _id: ObjectID
  createdAt: Date
  updatedAt: Date
}

type AttributesOnCreate<DocumentType extends Document> = Omit<
  DocumentType,
  '_id' | 'createdAt' | 'updatedAt'
> &
  Partial<Pick<DocumentType, '_id' | 'createdAt' | 'updatedAt'>>

export const CASE_INSENSITIVE_COLLATION = { locale: 'en', strength: 2 }

class Repo<DocumentType extends Document> {
  public readonly schema: yup.Schema<any>
  public readonly collectionName: string
  private dataLoader: DataLoader<ObjectID, Readonly<DocumentType>>
  private indexes: IndexSpecification[]

  public static client?: MongoClient
  public static db?: Db
  private static connectionPromise?: Promise<void>
  private static instances: Repo<any>[] = []

  public static async connect(mongoUri: string) {
    if (Repo.connectionPromise) {
      return await Repo.connectionPromise
    }

    Repo.connectionPromise = MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(async (client) => {
      Repo.client = client
      Repo.db = Repo.client.db()
      await Repo.createIndexes()
    })

    return await Repo.connectionPromise
  }

  public static async disconnect() {
    if (Repo.client) {
      await Repo.client.close()
      Repo.client = undefined
      Repo.db = undefined
      Repo.connectionPromise = undefined
    }
  }

  public static async reconnect(mongoUri: string) {
    await Repo.disconnect()
    return await Repo.connect(mongoUri)
  }

  constructor({
    collectionName,
    schema,
    indexes = []
  }: {
    collectionName: string
    schema: yup.Schema<any>
    indexes?: IndexSpecification[]
  }) {
    Repo.instances.push(this)

    this.dataLoader = new DataLoader(this.loadData.bind(this), {
      cache: false
    })
    this.schema = schema
    this.collectionName = collectionName
    this.indexes = indexes
  }

  public async findById(id: ObjectID | null | undefined) {
    if (id) {
      return this.dataLoader.load(id)
    }
  }

  public async findByIds(ids: ObjectID[] | null | undefined) {
    return this.dataLoader.loadMany(ids || [])
  }

  public countDocuments = this.collectionMethod('countDocuments')
  public deleteMany = this.collectionMethod('deleteMany')
  public deleteOne = this.collectionMethod('deleteOne')
  public findOne = this.collectionMethod('findOne')
  public findOneAndDelete = this.collectionMethod('findOneAndDelete')
  public findOneAndUpdate = this.collectionMethod('findOneAndUpdate')
  public insertOne = this.collectionMethod('insertOne')
  public insertMany = this.collectionMethod('insertMany')
  public updateOne = this.collectionMethod('updateOne')
  public updateMany = this.collectionMethod('updateMany')
  public distinct = this.collectionMethod('distinct')

  public async aggregate(pipeline: object[] = [], options?: CollectionAggregationOptions) {
    const collection = await this.collection
    return collection.aggregate(pipeline, options)
  }

  public async find(query?: FilterQuery<DocumentType>, options?: FindOneOptions) {
    const collection = await this.collection
    return collection.find(query, options)
  }

  public async processInBatches({
    batchSize = 1000,
    query = {},
    process
  }: {
    batchSize?: number
    query?: FilterQuery<DocumentType>
    process: (records: DocumentType[]) => Promise<any>
  }) {
    const collection = await this.collection
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
  }

  public async exists(query?: FilterQuery<DocumentType>, options?: FindOneOptions) {
    const collection = await this.collection
    const foundCount = await collection
      .find(query, options)
      .limit(1)
      .count()

    return foundCount > 0
  }

  public async createDocument(document: AttributesOnCreate<DocumentType>) {
    const castDocument = await this.schema.validate(document)

    const collection = await this.collection

    const result = await collection.insertOne({
      createdAt: document.createdAt || new Date(),
      updatedAt: document.updatedAt || new Date(),
      ...castDocument
    } as any)

    return await this.findById(result.insertedId)
  }

  public async updateDocument(
    document: DocumentType,
    update: UpdateQuery<DocumentType>,
    options?: FindOneAndUpdateOption
  ) {
    const result = await (await this.collection).findOneAndUpdate(
      { _id: document._id } as any,
      { ...update, $set: { updatedAt: new Date(), ...update.$set } },
      { returnOriginal: false, ...options }
    )

    return result.value
  }

  public async deleteDocument(document: DocumentType) {
    ;(await this.collection).deleteOne({ _id: document._id } as any)
    return document
  }

  public async deleteDocuments(documents: DocumentType[]) {
    ;(await this.collection).deleteMany({
      _id: { $in: documents.map((document) => document._id) }
    } as any)
    return documents
  }

  public get collection() {
    if (!Repo.client || !Repo.client.isConnected) {
      throw new Error('Please initiate a mongodb connection first')
    }
    return Promise.resolve(Repo.db.collection<DocumentType>(this.collectionName))
  }

  private collectionMethod<Name extends keyof Collection>(
    name: Name
  ): Collection<Readonly<DocumentType>>[Name] {
    return async (...args) => (await this.collection)[name](...args)
  }

  private async loadData(ids: ObjectID[]) {
    const documents = await this.collection.then((collection) =>
      collection.find({ _id: { $in: ids } } as any).toArray()
    )

    return ids.map((id) =>
      documents.find((document) => document._id.toHexString() === id.toHexString())
    )
  }

  private static async createIndexes() {
    return Promise.all(
      Repo.instances.map((instance) => {
        return instance.syncIndexes()
      })
    )
  }

  private async syncIndexes() {
    await syncIndexes(Repo.db, await this.collection, this.indexes)
  }
}

export default Repo
