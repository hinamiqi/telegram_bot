import { Collection, Db, DeleteResult, MongoClient, WithId } from "mongodb";

import { ISet } from "../models/set.interface";
import { IExercise } from "../models/exercise.interface";

export class MongoRepository {
    private uri = 'mongodb://localhost:27017';

    private dbName = 'gymbot-db';

    private readonly SET_COLLECTION = 'sets';
    private readonly EXERCISE_COLLECTION = 'exercise';

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

    private get exerciseCollection(): Collection<IExercise> {
        return this.db.collection<IExercise>(this.EXERCISE_COLLECTION);
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

    async addNewExercise(exercise: IExercise): Promise<void> {
        const result = await this.exerciseCollection.insertOne(exercise);
        console.log(`Added exercise with id ${result.insertedId}`);
    }

    async getCurrentWorkout(userId: number): Promise<WithId<ISet>[]> {
        const query = {
            userId: { $eq: userId },
            date: {
                $gte: new Date(new Date().setHours(0, 0, 0)),
            }
        };
        const result = this.setsCollection.find(query);
        const findResult = result.toArray();
        return findResult;
    }

    async getLastExerciseWorkout(userId: number, exerciseName: string): Promise<WithId<ISet>[]> {
        const query = {
            userId: { $eq: userId },
            exerciseName: { $eq: exerciseName },
        };
        const lastOne = this.setsCollection.find(query).sort({date: -1}).limit(1);
        const lastDate = (await lastOne.next())?.date;
        if (!lastDate) {
            return [];
        }
        const query2 = {
            userId: { $eq: userId },
            exerciseName: { $eq: exerciseName },
            date: { $gt: new Date(lastDate.setHours(0, 0, 0)), $lt: new Date(lastDate.setHours(23, 59, 59)) },
        };
        return this.setsCollection.find(query2).toArray();
    }

    async getLastWorkout(userId: number): Promise<WithId<ISet>[]> {
        const query = {
            userId: { $eq: userId },
        };
        const lastOne = this.setsCollection.find(query).sort({date: -1}).limit(1);
        const lastDate = (await lastOne.next())?.date;
        if (!lastDate || this.isCurrentDate(lastDate)) {
            return [];
        }
        const query2 = {
            userId: { $eq: userId },
            date: { $gt: new Date(lastDate.setHours(0, 0, 0)), $lt: new Date(lastDate.setHours(23, 59, 59)) },
        };
        return this.setsCollection.find(query2).toArray();
    }

    async getCategoryExercises(userId: number, category: string): Promise<WithId<IExercise>[]> {
        const query = {
            userId: { $eq: userId },
            category,
        };
        return this.exerciseCollection.find(query).toArray();
    }

    async getAllExercises(userId: number): Promise<WithId<IExercise>[]> {
        const query = {
            userId: { $eq: userId }
        };
        return this.exerciseCollection.find(query).toArray();
    }

    async countExercises(userId: number): Promise<number> {
        const query = {
            userId: { $eq: userId }
        };
        return this.exerciseCollection.countDocuments(query);
    }

    async getAllSets(userId: number): Promise<WithId<ISet>[]> {
        const query = {
            userId: { $eq: userId }
        };
        return this.setsCollection.find(query).toArray();
    }

    async countSets(userId: number): Promise<number> {
        const query = {
            userId: { $eq: userId }
        };
        return this.setsCollection.countDocuments(query);
    }

    async removeAllExersices(userId: number): Promise<DeleteResult> {
        const query = {
            userId: { $eq: userId }
        };
        return this.exerciseCollection.deleteMany(query);
    }

    async removeAllSets(userId: number): Promise<DeleteResult> {
        const query = {
            userId: { $eq: userId }
        };
        return this.setsCollection.deleteMany(query);
    }

    private isCurrentDate(date: Date): boolean {
        const d1 = new Date(date.setHours(0, 0, 0, 0)).getTime();
        const d2 = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
        return d1 == d2;
    }
}