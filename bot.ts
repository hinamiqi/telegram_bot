import { Bot, CallbackQueryContext, Context, InlineKeyboard, Keyboard } from "grammy";
import { StateManager } from "./state";
import { IMenuConfig } from "./interfaces/menu-config.interface";
import InlineKeyboardBuilder from "./inline-keyboard-builder";
import { GO_BACK_BTN_ID } from "./constants";
import { ParseMode } from "grammy/types";

const bot = new Bot('7033893832:AAHaJMv8EEt45Wp2vRbZW7NZf94puaBIU00');
const state = new StateManager();

let lastCtxMessage: CallbackQueryContext<Context>;

const getMenuMarkup = (state: StateManager): { parse_mode: ParseMode; reply_markup: InlineKeyboard } => ({
  parse_mode: "MarkdownV2",
  reply_markup: InlineKeyboardBuilder.getKeyboardWithButtonList(state.currentMenu.children?.map(({ id, name }) => ({ id, name })) || [], !!state.currentMenu.parent),
});

const getExerciseMarkup = (state: StateManager): { parse_mode: ParseMode; reply_markup: InlineKeyboard } => ({
  parse_mode: "MarkdownV2",
  reply_markup: new InlineKeyboard().text('Change weight').row().text('Add comment').row().text('🔙', GO_BACK_BTN_ID),
});

// This handler sends a menu with the inline buttons we pre-assigned above
bot.command('start', async (ctx) => {
    await ctx.reply(state.message, getMenuMarkup(state));
});

bot.callbackQuery(/[A-z_]+__menu/, async (ctx) => {
  state.selectSubMenu(ctx.callbackQuery.data);
  lastCtxMessage = ctx;
  await ctx.editMessageText(state.message, getMenuMarkup(state));
});

bot.callbackQuery(GO_BACK_BTN_ID, async (ctx) => {
  state.goBack();
  lastCtxMessage = ctx;
  await ctx.editMessageText(state.message, getMenuMarkup(state));
});

bot.callbackQuery(/[A-z_]+__exercise/, async (ctx) => {
  state.selectSubMenu(ctx.callbackQuery.data);
  lastCtxMessage = ctx;
  await ctx.editMessageText(state.message, getExerciseMarkup(state));
});

bot.on("message", async (ctx) => {
  //Print to console
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`,
  );
  
  if (state.currentMenu.isExercise) {
    state.addSet(state.currentMenu.name, parseInt(ctx.message?.text || "0"), 10)
  }

  await ctx.deleteMessage();

  await lastCtxMessage?.editMessageText(state.message, getExerciseMarkup(state));
});

//Start the Bot
bot.start();


// console.log(state.toString());
// state.selectSubMenu('chest__bodypart');
// console.log(state.toString());
// state.goBack();
// console.log(state.toString());