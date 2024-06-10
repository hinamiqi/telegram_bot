import { DEFAULT_EXERCISE_DESCRIPTION, DEFAULT_MENU_DESCRIPTION, STARTING_MENU_ID } from "./constants";
import { IMenuConfig } from "../interfaces/menu-config.interface";

export const MENU_CONFIG: IMenuConfig = {
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
                    id: 'flat_bb_bench_press__menu',
                    name: 'Flat barbell bench press',
                    description: DEFAULT_EXERCISE_DESCRIPTION,
                    isExercise: true,
                },
                {
                    id: 'incline_df_bench_press__menu',
                    name: 'Incline dumbbell bench press',
                    description: DEFAULT_EXERCISE_DESCRIPTION,
                    isExercise: true,
                },
                {
                    id: 'dips__menu',
                    name: 'Dips',
                    description: DEFAULT_EXERCISE_DESCRIPTION,
                    isExercise: true,
                },
                {
                    id: 'cable_row__menu',
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
                    id: 'pull_up__menu',
                    name: 'Pull up',
                    description: DEFAULT_EXERCISE_DESCRIPTION,
                    isExercise: true,
                },
                {
                    id: 'bb_row__menu',
                    name: 'Barbell row',
                    description: DEFAULT_EXERCISE_DESCRIPTION,
                    isExercise: true,
                },
                {
                    id: 'cable_row__menu',
                    name: 'Cable row',
                    description: DEFAULT_EXERCISE_DESCRIPTION,
                    isExercise: true,
                },
            ],
        },
    ],
};