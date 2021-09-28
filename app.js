require("dotenv").config();
const app = require("express")();
const { bot, fetchMovies } = require("./telegram");

port = process.env.PORT | 5000;

const secretPath = `/telegraf/${bot.secretPathComponent()}`;

// Set telegram webhook
// npm install -g localtunnel && lt --port 3000
bot.telegram.setWebhook(`https://wonderful-bear-79.loca.lt${secretPath}`);

app.get("/", async (req, res) => {
  const movies = await fetchMovies();
  res.status(200).json(movies);
});

// Set the bot API endpoint
app.use(bot.webhookCallback(secretPath));
app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});

// No need to call bot.launch()
