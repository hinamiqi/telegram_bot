import { DEFAULT_EXERCISE_DESCRIPTION, DEFAULT_MENU_DESCRIPTION, EXERCISE_WEIGTH_DESCRIPTION, STARTING_MENU_ID } from "./constants/constants";
import { MENU_CONFIG } from "./constants/menu-config.const";
import { IMarkup } from "./interfaces/markup.interface";
import { IMenuConfig } from "./interfaces/menu-config.interface";
import MarkupHelper from "./markup-helper";
import { Repository } from "./repository";
import { Workout } from "./workout";

export class StateManager {
    currentMenu: IMenuConfig;

    workout: Workout;

    repository: Repository;

    private currentWeight = 10;

    private lastExerciseSetDescription: string = '\n';

    private _isWeightMode = false;

    get userId(): number {
        return <number>this._userId;
    }
    set userId(userId: number | undefined) {
        if (!userId) {
            throw new Error('Не удалось определить userId. Это какая-то херня!');
        } else {
            this._userId = userId;
        }
    }
    private _userId: number;

    get menu(): IMenuConfig {
        return this.menuConfig;
    }

    get isWeightMode(): boolean {
        return this._isWeightMode;
    }

    get currentMenuDescription(): string {
        if (this.currentMenu.isExercise) {
            return this.isWeightMode
            ? `${EXERCISE_WEIGTH_DESCRIPTION} ${this.currentWeightDescription}`
            : `${DEFAULT_EXERCISE_DESCRIPTION} ${this.currentWeightDescription}`;
        }
        return this.currentMenu.description || '';
    }

    get currentWeightDescription(): string {
        return `\\(current weight: ${this.currentWeight}kg\\)`;
    }

    private readonly menuConfig: IMenuConfig = MENU_CONFIG;

    constructor() {
        this.workout = new Workout();
        this.repository = new Repository();
        this.currentMenu = this.menuConfig;
        this.setParentToChildren(this.currentMenu);
    }

    async startWorkout(userId: number | undefined): Promise<void> {
        this.userId = userId;
        if (!this.repository.isConnected) {
            await this.repository.connect();
        }
        const lastWorkoutSets = await this.repository.getLastWorkout(this.userId);
        if (lastWorkoutSets.length) {
            this.lastExerciseSetDescription = `Last workout: ${MarkupHelper.getWorkoutText(lastWorkoutSets)}`;
        }
        await this.updateWorkout();
    }

    goBack(): void {
        if (this.currentMenu.parent) {
            this.currentMenu = this.currentMenu.parent;
            this.lastExerciseSetDescription = '\n';
        }
    }

    getMessage(): string {
        return `*Today's workout*\n\n${this.workout.toString()}\n*${this.currentMenu.name}*\n_${this.currentMenuDescription}_\n${this.lastExerciseSetDescription}`;
    }

    getCurrentMenuMarkup(): IMarkup {
        if (this.currentMenu.isExercise) {
            return MarkupHelper.getExerciseMarkup(this);
        } else {
            return MarkupHelper.getMenuMarkup(this);
        }
    }

    async selectSubMenu(menuId: string): Promise<void> {
        this.lastExerciseSetDescription = '\n';
        const { children } = this.currentMenu;
        const targetMenu = children?.find((c) => c.id === menuId);
        if (targetMenu) {
            this.currentMenu = targetMenu;
        }
        if (this.currentMenu.isExercise) {
            const lastSets = await this.repository.getLastExerciseWorkout(this.userId, this.currentMenu.name);
            if (!!lastSets) {
                this.lastExerciseSetDescription = `\nLast time: ${MarkupHelper.getRepsLine(lastSets)}`;
            }
        }
    }

    async updateWorkout(): Promise<void> {
        const findSets = await this.repository.getCurrentWorkout();
        this.workout.setSets(findSets);
    }

    async addSet(exerciseName: string, userInput: string | undefined): Promise<void> {
        const set = this.workout.addSet({
            userId: this.userId,
            exerciseName,
            weight: this.currentWeight,
            reps: this.parseUserInput(userInput),
            date: new Date()
        });
        console.log(set);
        await this.repository.saveSet(set);
    }

    changeWeight(userInput: string | undefined): void {
        this.currentWeight = this.parseUserInput(userInput);
    }

    toString(): string {
        const { name, description, children } = this.currentMenu;
        return `${name}\n${description}\n${children?.map(({ name }) => name).join(" ")}`;
    }

    getCurrentExercise(): void {
        this.repository.getExerciseSets(this.currentMenu.name);
    }

    toggleWeightMode(): void {
        this._isWeightMode = !this._isWeightMode;
    }

    private setParentToChildren(menu: IMenuConfig): void {
        if (!menu.children) return;
        for (let child of menu.children) {
            child.parent = menu;
            this.setParentToChildren(child);
        }
    }

    private parseUserInput(userInput: string | undefined): number {
        return parseInt(userInput || "0");
    }
}