import { UUID } from "crypto";

export interface ISet {
    userId: number;
    exerciseName: string;
    exerciseUuid: UUID;
    weight: number;
    reps: number;
    date: Date;
    comment?: string;
}
