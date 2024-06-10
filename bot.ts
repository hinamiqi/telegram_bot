import { Bot, CallbackQueryContext, Context } from "grammy";

import { StateManager } from "./state";
import { GO_BACK_BTN_ID, MENU_ITEM, MESSAGE, START, TOGGLE_MODE_ACTION } from "./constants/trigger.const";
import MarkupHelper from "./markup-helper";
import { SECRET } from "./constants/secret";

const bot = new Bot(SECRET);
let state: StateManager = new StateManager();

let lastCtxMessage: CallbackQueryContext<Context>;

// COMMANDS
bot.command(START, async (ctx) => {
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
    await ctx.editMessageText(state.getMessage(), state.getCurrentMenuMarkup());
});

bot.callbackQuery(GO_BACK_BTN_ID, async (ctx) => {
  lastCtxMessage = ctx;
  state.goBack();
  await ctx.editMessageText(state.getMessage(), state.getCurrentMenuMarkup());
});

bot.callbackQuery(TOGGLE_MODE_ACTION, async (ctx) => {
  lastCtxMessage = ctx;
  state.toggleWeightMode();
  await ctx.editMessageText(state.getMessage(), state.getCurrentMenuMarkup());
});

bot.on(MESSAGE, async (ctx) => {
  console.log(
    `${ctx.from.first_name} wrote ${
      "text" in ctx.message ? ctx.message.text : ""
    }`,
  );

  if (state.currentMenu.isExercise) {
    if (state.isWeightMode) {
      state.changeWeight(ctx.message?.text);
    } else {
      await state.addSet(state.currentMenu.name, ctx.message?.text)
    }
  }

  await ctx.deleteMessage();

  await lastCtxMessage?.editMessageText(state.getMessage(), MarkupHelper.getExerciseMarkup(state));
});

//Start the Bot
bot.start();
