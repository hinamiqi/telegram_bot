import { UUID, randomUUID } from "crypto";
import { DEFAULT_EXERCISE_DESCRIPTION, DEFAULT_MENU_DESCRIPTION, EXERCISE_WEIGTH_DESCRIPTION, MENU_SUFFIX, STARTING_MENU_ID } from "../constants/constants";
import { MENU_CONFIG } from "../constants/menu-config.const";
import { IMarkup } from "../models/markup.interface";
import { IMenuConfig } from "../models/menu-config.interface";
import MarkupBuilder from "../builders/markup-builder";
import { MongoRepository } from "../repositories/mongo.repository";
import { WorkoutModel } from "../models/workout.model";
import { UtilsService } from "./utils-service";
import { getMainMessage } from "../constants/templates";

export class StateService {
    currentMenu: IMenuConfig;

    workout: WorkoutModel;

    repository: MongoRepository;

    isAddExerciseMode = false;

    private currentWeight = 10;

    private lastExerciseSetDescription: string = '';

    private lastWorkoutDesription: string | undefined;

    private _isWeightMode = false;

    private readonly menuConfig: IMenuConfig = MENU_CONFIG;

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
        if (this.isAddExerciseMode) {
            return 'Input new exercise name';
        }
        if (this.currentMenu.isExercise) {
            return this.isWeightMode
            ? `${EXERCISE_WEIGTH_DESCRIPTION} ${this.currentWeightDescription}`
            : `${DEFAULT_EXERCISE_DESCRIPTION} ${this.currentWeightDescription}`;
        }
        return this.currentMenu.description || '';
    }

    get currentWeightDescription(): string | undefined {
        return MarkupBuilder.escapeReservedCharacters(`(current weight: ${this.currentWeight}kg)`);
    }

    constructor() {
        this.workout = new WorkoutModel();
        this.repository = new MongoRepository();
        this.currentMenu = this.menuConfig;
        this.setParentToChildren(this.currentMenu);
    }

    async stopWorkout(): Promise<void> {
        this.repository.disconnect();
    }

    async startWorkout(userId: number | undefined): Promise<void> {
        this.userId = userId;
        if (!this.repository.isConnected) {
            await this.repository.connect();
        }
        const lastWorkoutSets = await this.repository.getLastWorkout(this.userId);
        if (lastWorkoutSets.length) {
            this.lastWorkoutDesription = `${MarkupBuilder.getWorkoutText(lastWorkoutSets)}`;
        }
        await this.updateWorkout();
    }

    async getCurrentMenuMarkup(): Promise<IMarkup> {
        if (this.currentMenu.isExercise) {
            return MarkupBuilder.getExerciseMarkup(this);
        } else {
            return MarkupBuilder.getMenuMarkup(this);
        }
    }

    async selectSubMenu(menuId: string): Promise<void> {
        this.lastExerciseSetDescription = '';
        const { children } = this.currentMenu;
        const targetMenu = children?.find((c) => c.id === menuId);

        if (targetMenu) {
            this.currentMenu = targetMenu;
        }

        if (this.currentMenu.id !== STARTING_MENU_ID) {
            this.currentMenu.children = (await this.repository.getCategoryExercises(this.userId, UtilsService.getMenuIdFromTrigger(this.currentMenu.id))).map((exercise) => ({
                id: UtilsService.getMenuTrigger(exercise.id),
                name: exercise.name,
                description: exercise.description || DEFAULT_EXERCISE_DESCRIPTION,
                isExercise: true,
            }));
        }
        this.setParentToChildren(this.currentMenu);

        if (this.currentMenu.isExercise) {
            const lastSets = await this.repository.getLastExerciseWorkout(this.userId, this.currentMenu.name);
            if (!!lastSets) {
                const m = MarkupBuilder.escapeReservedCharacters(MarkupBuilder.getRepsLine(lastSets));
                this.lastExerciseSetDescription = m && `Last time: ${m}` || '';
            }
        }
    }

    async updateWorkout(): Promise<void> {
        const findSets = await this.repository.getCurrentWorkout(this.userId);
        this.workout.setSets(findSets);
    }

    // Should return Promise<true> if set was succesfully added
    async addSet(currentMenu: IMenuConfig, userInput: string | undefined): Promise<boolean> {
        const parsed = this.parseUserInput(userInput);
        if (isNaN(parsed) || parsed < 0) { // Reps can't be negative
            return false;
        }
        const set = this.workout.addSet({
            userId: this.userId,
            exerciseUuid: <UUID>UtilsService.getMenuIdFromTrigger(currentMenu.id),
            exerciseName: currentMenu.name,
            weight: this.currentWeight,
            reps: parsed,
            date: new Date()
        });
        await this.repository.saveSet(set);
        return true;
    }

    async addNewExercise(exerciseName: string | undefined): Promise<void> {
        if (!exerciseName) return;
        await this.repository.addNewExercise({
            id: randomUUID(),
            name: exerciseName,
            userId: this.userId,
            category: UtilsService.getMenuIdFromTrigger(this.currentMenu.id), 
        });
        await this.selectSubMenu(this.currentMenu.id);
    }

    async reactToUserMessage(messageText: string | undefined): Promise<boolean> {
        const isAddExercise = messageText && this.isAddExerciseMode;
        const isChangingExerciseWeight = messageText && this.currentMenu.isExercise && this.isWeightMode;
        const isAddingSet = messageText && this.currentMenu.isExercise && !this.isWeightMode;

        if (isAddExercise) {
            await this.addNewExercise(messageText);
            this.toggleAddExerciseMode();
            return true;
        }

        if (isChangingExerciseWeight) {
            return this.changeWeight(messageText);
        }

        if (isAddingSet) {
            return await this.addSet(this.currentMenu, messageText)
        }

        return false;
    }

    goBack(): void {
        if (this.currentMenu.parent) {
            this.currentMenu = this.currentMenu.parent;
            this.lastExerciseSetDescription = '';
        }
    }

    getMessage(): string {
        return getMainMessage(
            this.workout.toString(),
            this.currentMenu.name,
            this.currentMenuDescription,
            this.lastWorkoutDesription,
            this.lastExerciseSetDescription
        );
    }

    // Should return true if weight is changed
    changeWeight(userInput: string | undefined): boolean {
        const parsed = this.parseUserInput(userInput);
        if (!isNaN(parsed)) { // Weight CAN be negative
            this.currentWeight = parsed;
            this.toggleWeightMode();
            return true;
        }
        return false;
    }

    toString(): string {
        const { name, description, children } = this.currentMenu;
        return `${name}\n${description}\n${children?.map(({ name }) => name).join(" ")}`;
    }

    toggleWeightMode(): void {
        this._isWeightMode = !this._isWeightMode;
    }

    toggleAddExerciseMode(): void {
        this.isAddExerciseMode = !this.isAddExerciseMode;
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