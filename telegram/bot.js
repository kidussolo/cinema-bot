const { Telegraf, Markup } = require("telegraf");
const { fetchMovies } = require("./api");

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(token);

bot.use(Telegraf.log());

bot.command("onetime", (ctx) =>
  ctx.reply(
    "One time keyboard",
    Markup.keyboard(["/simple", "/inline", "/pyramid"]).oneTime().resize()
  )
);

bot.command("start", async (ctx) => {
  return await ctx.reply(
    `Welcome ${ctx.message.chat.first_name} 🎬 🎥 we're happy you're here 🤡 🎉`,
    Markup.keyboard([
      ["🔍 Search", "😎 Movies"], // Row1 with 2 buttons
      ["☸ Setting", "📞 Feedback"], // Row2 with 2 buttons
      ["📢 View Cinema", " Get location"], // Row3 with 3 buttons
    ])
      .oneTime()
      .resize()
  );
});

bot.hears("🔍 Search", (ctx) => ctx.reply("Yay!"));
bot.hears("📢 Ads", (ctx) => ctx.reply("Free hugs. Call now!"));
bot.hears("😎 Movies", async (ctx) => {
  const movies = await prepMedia();
  for (let movie of movies) {
    ctx.replyWithPhoto(movie.img, {
      caption: createMessageText(movie),
      parse_mode: "Html",
      ...Markup.inlineKeyboard([Markup.button.callback("Book", "book")]),
    });
  }
});

bot.action("book", (ctx) => {
  return ctx.reply(
    "Please Select Date 😊",
    Markup.keyboard([
      Markup.button.callback("Sat sep 28"),
      Markup.button.callback("Sun sep 29"),
      Markup.button.callback("Main menu"),
    ])
      .oneTime()
      .resize()
  );
});

bot.hears("Sat sep 28", (ctx) => {
  return ctx.reply(
    "Please Select Cinema 😊",
    Markup.keyboard([
      Markup.button.callback("🎬  Cinema1 2D"),
      Markup.button.callback("🎬  Cinema2 3D"),
      Markup.button.callback("Main menu"),
    ])
      .oneTime()
      .resize()
  );
});

bot.hears("🎬  Cinema1 2D", (ctx) => {
  ctx.reply(
    "Please take a sit 🪑",
    Markup.keyboard([generateSit(), generateSit(), generateSit()])
      .oneTime()
      .resize()
  );
});

bot.hears("1", (ctx) => {
  return ctx.reply(
    "Confirm order",
    Markup.keyboard([
      Markup.button.callback("Confirm", "confirm"),
      Markup.button.callback("Cancel", "cancel"),
      Markup.button.callback("Main menu"),
    ])
      .oneTime()
      .resize()
  );
});

bot.hears("Confirm", (ctx) => {
  return ctx.reply(
    "Thank your for choosing us, your sit is reserved for your you'll be asked to make payment on your way in"
  );
});
const generateSit = () => {
  let sits = [];
  for (let i = 1; i <= 8; i++) {
    sits.push(Markup.button.callback(i, i));
  }
  return sits;
};

const createMessageText = (movie) => {
  return `
  <strong>${movie.title}</strong>
  <em>${movie.type}</em>
  <strong>${movie.actions}</strong>
  <strong>${movie.rank}</strong>`;
};

const prepMedia = async () => {
  const movies = await fetchMovies();

  let data = [];
  for (let movie of movies.d) {
    let d = {
      img: movie.i.imageUrl,
      title: movie.l,
      type: movie.q,
      rank: movie.rank,
      actions: movie.s,
    };
    data.push(d);
  }

  return data;
};

const requestPhoneKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Book",
          callback_data: "Book",
        },
      ],
    ],
  },
};

bot.command("special", (ctx) => {
  return ctx.reply(
    "Special buttons keyboard",
    Markup.keyboard([
      Markup.button.contactRequest("Send contact"),
      Markup.button.locationRequest("Send location"),
    ]).resize()
  );
});

bot.command("pyramid", (ctx) => {
  return ctx.reply(
    "Keyboard wrap",
    Markup.keyboard(["one", "two", "three", "four", "five", "six"], {
      wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2,
    })
  );
});

bot.command("simple", (ctx) => {
  return ctx.replyWithHTML(
    "<b>Coke</b> or <i>Pepsi?</i>",
    Markup.keyboard(["Coke", "Pepsi"])
  );
});

bot.command("inline", (ctx) => {
  return ctx.reply("<b>Coke</b> or <i>Pepsi?</i>", {
    parse_mode: "HTML",
    ...Markup.inlineKeyboard([
      Markup.button.callback("Coke", "Coke"),
      Markup.button.callback("Pepsi", "Pepsi"),
    ]),
  });
});

bot.command("random", (ctx) => {
  return ctx.reply(
    "random example",
    Markup.inlineKeyboard([
      Markup.button.callback("Coke", "Coke"),
      Markup.button.callback("Dr Pepper", "Dr Pepper", Math.random() > 0.5),
      Markup.button.callback("Pepsi", "Pepsi"),
    ])
  );
});

bot.command("caption", (ctx) => {
  return ctx.replyWithPhoto(
    { url: "https://picsum.photos/200/300/?random" },
    {
      caption: "Caption",
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.callback("Plain", "plain"),
        Markup.button.callback("Italic", "italic"),
      ]),
    }
  );
});

bot.hears(/\/wrap (\d+)/, (ctx) => {
  return ctx.reply(
    "Keyboard wrap",
    Markup.keyboard(["one", "two", "three", "four", "five", "six"], {
      columns: parseInt(ctx.match[1]),
    })
  );
});

bot.action("Dr Pepper", (ctx, next) => {
  return ctx.reply("👍").then(() => next());
});

bot.action("plain", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageCaption(
    "Caption",
    Markup.inlineKeyboard([
      Markup.button.callback("Plain", "plain"),
      Markup.button.callback("Italic", "italic"),
    ])
  );
});

bot.action("italic", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageCaption("_Caption_", {
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      Markup.button.callback("Plain", "plain"),
      Markup.button.callback("* Italic *", "italic"),
    ]),
  });
});

bot.action(/.+/, (ctx) => {
  return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`);
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = { bot };
