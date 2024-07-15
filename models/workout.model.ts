import { ISet } from "./set.interface";
import MarkupBuilder from "../builders/markup-builder";

// TODO
export class WorkoutModel {
    private sets: ISet[] = [];

    public addSet(set: ISet): ISet {
        this.sets.push(set);
        return set;
    }

    public setSets(sets: ISet[]): void {
        this.sets = sets;
    }

    public toString(): string | undefined {
        return MarkupBuilder.getWorkoutText(this.sets);
    }
}