import { ISet } from "./interfaces/set.interface";
import MarkupHelper from "./markup-helper";

// TODO remove this -- it does nothing
export class Workout {
    private sets: ISet[] = [];

    public addSet(set: ISet): ISet {
        this.sets.push(set);
        return set;
    }

    public setSets(sets: ISet[]): void {
        this.sets = sets;
    }

    public toString(): string {
        return MarkupHelper.getWorkoutText(this.sets);
    }
}