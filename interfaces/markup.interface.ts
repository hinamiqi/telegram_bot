import { InlineKeyboard } from "grammy";
import { ParseMode } from "grammy/types";

export interface IMarkup {
    parse_mode: ParseMode;
    reply_markup: InlineKeyboard;
}