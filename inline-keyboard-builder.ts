import { InlineKeyboard } from "grammy"

import { GO_BACK_BTN_ID } from "./constants";

export default class InlineKeyboardBuilder {
    static getKeyboardWithButtonList(buttons: { id: string; name: string }[], isBackNeeded = false): InlineKeyboard {
        const keyboard = new InlineKeyboard();
        let i = 1;
        for (let b of buttons) {
            keyboard.text(b.name, b.id);
            if (i % 2 === 0) {
                keyboard.row();
            }
            i += 1;
        }
        if (isBackNeeded) {
            keyboard.row();
            keyboard.text('🔙', GO_BACK_BTN_ID);
        }
        return keyboard;
    }
}