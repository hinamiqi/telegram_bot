import { DEFAULT_EXERCISE_DESCRIPTION, DEFAULT_MENU_DESCRIPTION, MENU_SUFFIX, STARTING_MENU_ID } from "./constants";
import { IMenuConfig } from "../models/menu-config.interface";
import { BODYPARTS } from "./bodypart.const";

export const MENU_CONFIG: IMenuConfig = {
    id: STARTING_MENU_ID,
    name: 'Welcome to new workout',
    description: 'Select bodypart to train',
    children: [
        {
            id: BODYPARTS.CHEST + MENU_SUFFIX,
            name: 'Chest',
            description: DEFAULT_MENU_DESCRIPTION,
            children: [],
        },
        {
            id: BODYPARTS.BACK + MENU_SUFFIX,
            name: 'Back',
            description: DEFAULT_MENU_DESCRIPTION,
            children: [],
        },
        {
            id: BODYPARTS.LEGS + MENU_SUFFIX,
            name: 'Legs',
            description: DEFAULT_MENU_DESCRIPTION,
            children: [],
        },
        {
            id: BODYPARTS.BICEP + MENU_SUFFIX,
            name: 'Bicep',
            description: DEFAULT_MENU_DESCRIPTION,
            children: [],
        },
        {
            id: BODYPARTS.TRICEP + MENU_SUFFIX,
            name: 'Tricep',
            description: DEFAULT_MENU_DESCRIPTION,
            children: [],
        },
        {
            id: BODYPARTS.SHOULDERS + MENU_SUFFIX,
            name: 'Shoulders',
            description: DEFAULT_MENU_DESCRIPTION,
            children: [],
        },
        {
            id: BODYPARTS.ACCESSORIES + MENU_SUFFIX,
            name: 'Accessories',
            description: DEFAULT_MENU_DESCRIPTION,
            children: [],
        },
    ],
};