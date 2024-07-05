import { Bot, CallbackQueryContext, Context } from "grammy";

import { StateManager } from "./state";
import { ADD_EXERCISE_BTN_ID, GO_BACK_BTN_ID, MENU_ITEM, MESSAGE, START, TOGGLE_MODE_ACTION } from "./constants/trigger.const";
import MarkupHelper from "./markup-helper";

const config = require('./config.json');
if (!config || !config.secret) {
  throw new Error('No bot token was provided (check ./config.json for `secret` property)');
}

const bot = new Bot(config.secret);
let state: StateManager = new StateManager();

let lastCtxMessage: CallbackQueryContext<Context>;

// COMMANDS
bot.command(START, async (ctx) => {
  console.log(`Got START command from user ${(await ctx.getAuthor()).user.username}`);
  if (!!state) {
    state.stopWorkout();
    state = new StateManager();
  }
  await state.startWorkout(ctx.message?.from.id);
  await ctx.reply(state.getMessage(), MarkupHelper.getMenuMarkup(state));
});

// bot.command("stat", async (ctx) => {
//     // IMPLEMENT this
// });


// CALLBACK QUERIES
bot.callbackQuery(MENU_ITEM, async (ctx) => {
    lastCtxMessage = ctx;
    await state.selectSubMenu(ctx.callbackQuery.data);
    await ctx.editMessageText(state.getMessage(), await state.getCurrentMenuMarkup());
});

bot.callbackQuery(GO_BACK_BTN_ID, async (ctx) => {
  lastCtxMessage = ctx;
  if (state.isAddExerciseMode) {
    state.toggleAddExerciseMode();
  } else {
    state.goBack();
  }
  await ctx.editMessageText(state.getMessage(), await state.getCurrentMenuMarkup());
});

bot.callbackQuery(TOGGLE_MODE_ACTION, async (ctx) => {
  lastCtxMessage = ctx;
  state.toggleWeightMode();
  await ctx.editMessageText(state.getMessage(), await state.getCurrentMenuMarkup());
});

bot.callbackQuery(ADD_EXERCISE_BTN_ID, async (ctx) => {
  lastCtxMessage = ctx;
  state.toggleAddExerciseMode();
  await ctx.editMessageText(state.getMessage(), await state.getCurrentMenuMarkup());
});

bot.on(MESSAGE, async (ctx) => {
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`,
  );

  if (state.isAddExerciseMode) {
    await state.addNewExercise(ctx.message?.text);
    state.toggleAddExerciseMode();
  } else if (state.currentMenu.isExercise) {
    if (state.isWeightMode) {
      state.changeWeight(ctx.message?.text);
    } else {
      await state.addSet(state.currentMenu, ctx.message?.text)
    }
  }

  await ctx.deleteMessage();

  await lastCtxMessage?.editMessageText(state.getMessage(), await state.getCurrentMenuMarkup());
});

//Start the Bot
bot.start().catch((e) => {
  console.log(`Error in bot`, e);
});
