import {
  MongoClient,
  Db,
  Collection,
  InsertOneResult,
  WithId,
  Document,
  UpdateResult,
  DeleteResult,
} from 'mongodb';

export class DatabaseManager {
  private static client: MongoClient = new MongoClient(
    process.env.MONGO_URL ??
      (() => {
        throw new Error('MongoDB URL not provided in .env file');
      })()
  );
  private static db: Db = this.client.db('GroupifyDB');
  private collection: Collection;

  constructor(collectionName: string) {
    if (!DatabaseManager.db) {
      throw new Error(
        'Database not initialized. Call BaseMongoDB.initialize first.'
      );
    }
    this.collection = DatabaseManager.db.collection(collectionName);
  }

  public async create(
    doc: Record<string, unknown>
  ): Promise<InsertOneResult<Document>> {
    return await this.collection.insertOne(doc);
  }

  public async find(
    filter: Record<string, unknown> = {}
  ): Promise<WithId<Document>[]> {
    return this.collection.find(filter).toArray();
  }

  public async findOne(
    filter: Record<string, unknown>
  ): Promise<WithId<Document> | null> {
    return this.collection.findOne(filter);
  }

  public async update(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options: { upsert?: boolean } = {}
  ): Promise<UpdateResult<Document>> {
    return await this.collection.updateMany(filter, update, {
      upsert: options.upsert,
    });
  }

  public async delete(filter: Record<string, unknown>): Promise<DeleteResult> {
    return await this.collection.deleteMany(filter);
  }

  public async removeField(
    filter: Record<string, unknown>,
    field: string
  ): Promise<UpdateResult<Document>> {
    const updateQuery = { $unset: { [field]: '' } };
    return await this.collection.updateMany(filter, updateQuery);
  }

  public async fieldExists(
    filter: Record<string, unknown>,
    field: string
  ): Promise<boolean> {
    const document = await this.collection.findOne({
      ...filter,
      [field]: { $exists: true },
    });
    return document !== null;
  }

  public async addField(
    search: Record<string, unknown>,
    field: string,
    value: unknown
  ) {
    return await this.collection.updateMany(search, {
      $set: { [field]: value },
    });
  }

  public async aggregate(pipeline: Record<string, unknown>[]) {
    return await this.collection.aggregate(pipeline).toArray();
  }

  public static async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }
}
