import { DASH } from "./constants";

export interface ISet {
    exerciseName: string;
    weight: number;
    reps: number;
}

const HEADER = `*Today's workout:*`;

export class Workout {
    private sets: ISet[] = [];

    public addSet(set: ISet) {
        this.sets.push(set);
    }

    public toString(): string {
        // let m = HEADER + '\n';
        let m = '';
        const exercises = new Map<string, ISet[]>();
        for (let e of this.sets) {
            const curr = exercises.get(e.exerciseName) || [];
            exercises.set(e.exerciseName, curr.concat(e));
        }
        exercises.forEach((sets, exerciseName) => {
            m += this.getExerciseLine(exerciseName);
        });
        if (!m.length) {
            m = DASH;
        }
        return m;
    }

    private getExerciseLine(exerciseName: string, comment: string = '') {
        const commentLine = !!comment ? `_${comment}_` : '';
        return `*${exerciseName}* ${this.getRepsLine(exerciseName)}${commentLine}\n`;
    }

    private getRepsLine(exerciseName: string): string {
        const exerciseSets = this.sets.filter((s) => s.exerciseName === exerciseName);
        const weights = new Map<number, ISet[]>();
        for (let s of exerciseSets) {
            const curr = weights.get(s.weight) || [];
            weights.set(s.weight, curr.concat(s));
        }
        const lines: string[] = [];
        weights.forEach((sets, weight) => {
            // console.log(sets);
            lines.push(`${weight}kg: ${sets.map((s) => s.reps).join(', ')}`);
        });
        return lines.join('; ').concat('\\.');
    }

}