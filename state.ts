import { DEFAULT_EXERCISE_DESCRIPTION, DEFAULT_MENU_DESCRIPTION, STARTING_MENU_ID } from "./constants";
import { IMenuConfig } from "./interfaces/menu-config.interface";
import { Workout } from "./workout";

export class StateManager {
    currentMenu: IMenuConfig;

    workout: Workout;

    get menu(): IMenuConfig {
        return this.menuConfig;
    }

    get message(): string {
        return `*Today's workout*\n\n${this.workout.toString()}\n*${this.currentMenu.name}*\n_${this.currentMenu.description}_`;
    }

    private menuConfig: IMenuConfig = {
        id: STARTING_MENU_ID,
        name: 'Welcome to new workout',
        description: 'Select bodypart to train',
        children: [
            {
                id: 'chest__menu',
                name: 'Chest',
                description: DEFAULT_MENU_DESCRIPTION,
                children: [
                    {
                        id: 'flat_bb_bench_press__exercise',
                        name: 'Flat barbell bench press',
                        description: DEFAULT_EXERCISE_DESCRIPTION,
                        isExercise: true,
                    },
                    {
                        id: 'incline_df_bench_press__exercise',
                        name: 'Incline dumbbell bench press',
                        description: DEFAULT_EXERCISE_DESCRIPTION,
                        isExercise: true,
                    },
                    {
                        id: 'dips__exercise',
                        name: 'Dips',
                        description: DEFAULT_EXERCISE_DESCRIPTION,
                        isExercise: true,
                    },
                    {
                        id: 'cable_row__exercise',
                        name: 'Cable row',
                        description: DEFAULT_EXERCISE_DESCRIPTION,
                        isExercise: true,
                    },
                ],
            },
            {
                id: 'back__menu',
                name: 'Back',
                description: DEFAULT_MENU_DESCRIPTION,
                children: [
                    {
                        id: 'pull_up__exercise',
                        name: 'Pull up',
                        description: DEFAULT_EXERCISE_DESCRIPTION,
                        isExercise: true,
                    },
                    {
                        id: 'bb_row__exercise',
                        name: 'Barbell row',
                        description: DEFAULT_EXERCISE_DESCRIPTION,
                        isExercise: true,
                    },
                    {
                        id: 'cable_row__exercise',
                        name: 'Cable row',
                        description: DEFAULT_EXERCISE_DESCRIPTION,
                        isExercise: true,
                    },
                ],
            },
        ],
    };

    constructor() {
        this.currentMenu = this.menuConfig;
        this.setParentToChildren(this.currentMenu);
        this.workout = new Workout();
    }

    goBack(): void {
        if (this.currentMenu.parent) {
            this.currentMenu = this.currentMenu.parent;
        }
    }

    selectSubMenu(menuId: string): void {
        const { children } = this.currentMenu;
        const targetMenu = children?.find((c) => c.id === menuId);
        if (targetMenu) {
            this.currentMenu = targetMenu;
        }
    }

    addSet(exerciseName: string, reps: number, weight: number): void {
        this.workout.addSet({ exerciseName, weight, reps });
    }

    toString(): string {
        const { name, description, children } = this.currentMenu;
        return `${name}\n${description}\n${children?.map(({ name }) => name).join(" ")}`;
    }

    private setParentToChildren(menu: IMenuConfig): void {
        if (!menu.children) return;
        for (let child of menu.children) {
            child.parent = menu;
            this.setParentToChildren(child);
        }
    }
}