import { Bot, InlineKeyboard, Keyboard } from "grammy";
import InlineKeyboardBuilder from "./inline-keyboard-builder";

const bot = new Bot('7033893832:AAHaJMv8EEt45Wp2vRbZW7NZf94puaBIU00');

//Pre-assign menu text
const bodypartMenu = "<b>Choose bodypart</b>\n";
const exerciseMenu = "<b>Choose exercise</b>\n";
const setMenu = "<b>Enter weight in kg and reps</b>";

const goBackButton = 'go-back-button';

const bodypartList = [
  'Chest',
  'Back',
  'Legs',
  'Arms',
  'Shoulders',
  'Accessories',
];

const exercises: { [key: string]: string[] } = {
  'Chest': [
    'Flat barbell bench press',
    'Incline dumbbell bench press',
    'Dips',
    'Chest fly',
  ],
  'Back': [
    'Pull up',
    'Bent over row',
    'Pull down',
    'Pullover',
  ],
  'Legs': [
    'Squat',
    'Leg extension',
    'Romanian deadlift',
    'Bulgarian split squat',
  ],
  'Arms': [
    'Bicep curl',
    'Seated incline dumbbell curl',
    'Skullcrusher',
    'Rope pull down',
    'Overhead extension',
  ],
  'Shoulders': [
    'Overhead press',
    'Dumbbell lateral raise',
  ],
  'Accessories': [
    'Abs',
  ],
};

//Build keyboards
// const bodypartKeyboard = InlineKeyboardBuilder.getKeyboardWithButtonList(bodypartList);
const btn1 = { text: 'Chest' };
const mainKeyboard = new InlineKeyboard().webApp('Open workout', 'https://codepen.io/jznrxzyk-the-decoder/pen/yLWNMww');

const bodypartKeyboard = new InlineKeyboard().text('Chest').text('Back').row().text('Legs').text('Shoulders');


// const secondMenuMarkup = new InlineKeyboard().text(backButton, backButton).text(tutorialButton, "https://core.telegram.org/bots/tutorial");

// This handler sends a menu with the inline buttons we pre-assigned above
bot.command('start', async (ctx) => {
    await ctx.reply(bodypartMenu, {
      parse_mode: "HTML",
      reply_markup: new Keyboard().text('Test').text('Chest'),
    });
});



// bot.callbackQuery('open_web_app', async (ctx) => {
//   console.log(ctx.businessMessage);
//   await ctx.answerCallbackQuery();
// });

bot.callbackQuery(bodypartList, async (ctx) => {
  const bodypart = ctx.callbackQuery.data;
  await ctx.editMessageText(exerciseMenu + ctx.callbackQuery.data, {
    parse_mode: "HTML",
    reply_markup: InlineKeyboardBuilder.getKeyboardWithButtonList(exercises[bodypart]).text(goBackButton),
  });
});

// bot.callbackQuery(goBackButton, async (ctx) => {
//   await ctx.editMessageText(bodypartMenu, {
//     parse_mode: "HTML",
//     reply_markup: bodypartKeyboard,
//   });
// });
bot.callbackQuery(goBackButton, async (ctx) => {
  await ctx.editMessageText(bodypartMenu, {
    parse_mode: "HTML",
    reply_markup: bodypartKeyboard,
  });
});

bot.callbackQuery(new RegExp('[^:]+\:exercise'), async (ctx) => {
  await ctx.editMessageText(setMenu, {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(goBackButton),
  });
});



//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {
    //Print to console
    console.log(
      `${ctx.from.first_name} wrote ${
        "text" in ctx.message ? ctx.message.text : ""
      }`,
    );
    // await ctx.reply('Got that.')
    await ctx.deleteMessage();
  });


//Start the Bot
bot.start();
  