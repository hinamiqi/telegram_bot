import { Bot, CallbackQueryContext, Context } from "grammy";

import { StateService } from "./services/state-service";
import { ADD_EXERCISE_BTN_ID, GO_BACK_BTN_ID, MENU_ITEM, MESSAGE, TOGGLE_MODE_ACTION } from "./constants/trigger.const";
import { REMOVE_ALL_EXERCISES, REMOVE_ALL_SETS, SHOW_ALL_EXERCISES, SHOW_ALL_SETS, START, STATS } from "./constants/commands.const";
import MarkupBuilder from "./builders/markup-builder";

const config = require('./config.json');
if (!config || !config.secret) {
  throw new Error('No bot token was provided (check ./config.json for `secret` property)');
}

const bot = new Bot(config.secret);
let state: StateService = new StateService();

let lastCtxMessage: CallbackQueryContext<Context>;

// COMMANDS
bot.command(START, async (ctx) => {
  console.log(`Got START command from user ${(await ctx.getAuthor()).user.username}`);
  if (!!state) {
    state.stopWorkout();
    state = new StateService();
  }
  await state.startWorkout(ctx.message?.from.id);
  await ctx.reply(state.getMessage(), MarkupBuilder.getMenuMarkup(state));
});

bot.command(STATS, async (ctx) => {
  const userName = (await ctx.getAuthor()).user.username;
  console.log(`Got STATS command from user ${userName}`);
  await ctx.reply(await state.getStats());
});

bot.command(SHOW_ALL_EXERCISES, async (ctx) => {
  const userName = (await ctx.getAuthor()).user.username;
  console.log(`Got SHOW_ALL_EXERCISES command from user ${userName}`);
  await ctx.reply(`All exercises of user ${userName}: ${await state.getAllExersises()}`);
});

bot.command(SHOW_ALL_SETS, async (ctx) => {
  const userName = (await ctx.getAuthor()).user.username;
  console.log(`Got SHOW_ALL_SETS command from user ${userName}`);
  await ctx.reply(`All sets of user ${userName}: ${await state.getAllSets()}`);
});

bot.command(REMOVE_ALL_EXERCISES, async (ctx) => {
  const userName = (await ctx.getAuthor()).user.username;
  console.log(`Got REMOVE_ALL_EXERCISES command from user ${userName}`);
  const count = await state.removeAllExercises();
  await ctx.reply(`Removed all exercises of user ${userName}, removed ${count} records`);
});

bot.command(REMOVE_ALL_SETS, async (ctx) => {
  const userName = (await ctx.getAuthor()).user.username;
  console.log(`Got REMOVE_ALL_SETS command from user ${userName}`);
  const count = await state.removeAllSets();
  await ctx.reply(`Removed all sets of user ${userName}, removed ${count} records`);
});


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
      'text' in ctx.message ? ctx.message.text : ''
    }`,
  );

  const isEditMessageNeeded = await state.reactToUserMessage(ctx.message?.text);

  await ctx.deleteMessage();

  if (isEditMessageNeeded) {
    await lastCtxMessage?.editMessageText(state.getMessage(), await state.getCurrentMenuMarkup());
  }
});

//Start the Bot
bot.start();

bot.catch((e) => {
  console.log(`Error in bot`, e);
})
