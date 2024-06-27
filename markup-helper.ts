import { InlineKeyboard } from "grammy";

import { ADD_EXERCISE_BTN_ID, GO_BACK_BTN_ID, TOGGLE_MODE_ACTION } from "./constants/trigger.const";
import { StateManager } from "./state";
import { IMarkup } from "./interfaces/markup.interface";
import { ISet } from "./interfaces/set.interface";
import { DASH, STARTING_MENU_ID } from "./constants/constants";

export default class MarkupHelper {
    public static getMenuMarkup(state: StateManager): IMarkup {
        let addExerciseButton = null;
        if (state.currentMenu.id !== STARTING_MENU_ID && !state.currentMenu.isExercise) {
            addExerciseButton = state.isAddExerciseMode ? 'Cancel adding' : 'Add new...';
        }
        return {
            parse_mode: "MarkdownV2",
            reply_markup: MarkupHelper.getKeyboardWithButtonList(
                state.currentMenu.children?.map(({ id, name }) => ({ id, name })) || [],
                !!state.currentMenu.parent,
                addExerciseButton
            ),
        };
    }

    public static getExerciseMarkup(state: StateManager): IMarkup {
        const btn = state.isWeightMode
            ? ['Back to sets', TOGGLE_MODE_ACTION]
            : ['Change weight', TOGGLE_MODE_ACTION];
        return {
            parse_mode: "MarkdownV2",
            reply_markup: new InlineKeyboard().text(btn[0], btn[1]).row().text('🔙', GO_BACK_BTN_ID),
        };
    }

    public static getRepsLine(exerciseSets: ISet[]): string {
        if (!exerciseSets.length) {
            return `—`;
        }
        const weights = new Map<number, ISet[]>();
        for (let s of exerciseSets) {
            const curr = weights.get(s.weight) || [];
            weights.set(s.weight, curr.concat(s));
        }
        const lines: string[] = [];
        weights.forEach((sets, weight) => {
            lines.push(`${weight}kg ${sets.map((s) => s.reps).join('/')}`);
        });
        return lines.join('; ').concat('\\.');
    }

    public static getWorkoutText(exerciseSets: ISet[]): string {
        let m = '';
        const exercises = new Map<string, ISet[]>();
        for (let e of exerciseSets) {
            const curr = exercises.get(e.exerciseName) || [];
            exercises.set(e.exerciseName, curr.concat(e));
        }
        exercises.forEach((sets, exerciseName) => {
            m += MarkupHelper.getExerciseLine(exerciseName, sets);
        });
        if (!m.length) {
            m = DASH;
        }
        return m;
    }

    public static getExerciseLine(exerciseName: string, sets: ISet[]) {
        return `*${exerciseName}* ${MarkupHelper.getRepsLine(sets)}\n`;
    }

    private static getKeyboardWithButtonList(buttons: { id: string; name: string }[], isBackNeeded: boolean, isAddExerciseBtn: string | null): InlineKeyboard {
        const keyboard = new InlineKeyboard();
        let i = 1;
        for (let b of buttons) {
            keyboard.text(b.name, b.id);
            if (i % 2 === 0) {
                keyboard.row();
            }
            i += 1;
        }
        if (isAddExerciseBtn) {
            keyboard.row();
            keyboard.text(isAddExerciseBtn, ADD_EXERCISE_BTN_ID);
        }
        if (isBackNeeded) {
            keyboard.row();
            keyboard.text('🔙', GO_BACK_BTN_ID);
        }
        return keyboard;
    }

}