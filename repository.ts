import { Collection, Db, MongoClient, WithId } from "mongodb";

import { ISet } from "./interfaces/set.interface";

export class Repository {
    private uri = 'mongodb://localhost:27017';

    private dbName = 'gymbot-db';

    private readonly SET_COLLECTION = 'sets-collection';

    private client: MongoClient;

    private _isConnected = false;

    get isConnected(): boolean {
        return this._isConnected;
    }

    private get db(): Db {
        return this.client.db(this.dbName);
    }

    private get setsCollection(): Collection<ISet> {
        return this.db.collection<ISet>(this.SET_COLLECTION);
    }

    constructor() {
        this.client = new MongoClient(this.uri);
    }

    async connect(): Promise<void> {
        await this.client.connect();
        this._isConnected = true;
    }

    async disconnect(): Promise<void> {
        await this.client.close();
        this._isConnected = false;
    }

    async saveSet(set: ISet): Promise<void> {
        const result = await this.setsCollection.insertOne(set);
        console.log(`Saved set with id ${result.insertedId}`);
    }

    async getExerciseSets(exerciseName: string): Promise<void> {
        const today = new Date();
        today.setHours(0,0,0,0);
        const dateVal = today.getUTCDate();
        const query = {
            exerciseName: { $eq: exerciseName },
            date: {
                $gte: new Date(new Date().setHours(0, 0, 0)),
            },
        };
        const result = this.setsCollection.find(query);

        for await (const doc of result) {
            console.log(doc);
        }
    }

    async getCurrentWorkout(): Promise<WithId<ISet>[]> {
        const query = {
            date: {
                $gte: new Date(new Date().setHours(0, 0, 0)),
            }
        };
        const result = this.setsCollection.find(query);
        const findResult = result.toArray();
        return findResult;
    }

    async getLastExerciseSet(userId: number, exerciseName: string): Promise<WithId<ISet> | null> {
        const query = {
            userId: { $eq: userId },
            exerciseName: { $eq: exerciseName },
        };
        const result = this.setsCollection.find(query).sort({date: -1}).limit(1);
        return result.next();
    }
}