const TelegramBot = require("node-telegram-bot-api");
const puppeteer = require("puppeteer");
const fs = require("fs");
require("dotenv").config();

// Check if the lockfile exists
if (fs.existsSync("lockfile")) {
  console.error("The bot is already running");
  process.exit(1); // Exit the process
}

// Create the lockfile
fs.writeFileSync("lockfile", "");

// Создаем бота и указываем токен
const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

const options = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Показать скриншот главной страницы РБК",
          callback_data: "show_screenshot",
        },
      ],
    ],
  },
};

// Обработчик события нажатия на кнопку
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;

  try {
    await bot.sendMessage(chatId, "Получаю скриншот...");

    // Инициализируем браузер через Puppeteer
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Переходим на главную страницу RBK и создаем скриншот
    await page.goto("https://www.rbc.ru/");
    const screenshot = await page.screenshot();

    // Отправляем скриншот пользователю
    await bot.sendPhoto(chatId, screenshot);

    // Закрываем браузер
    await browser.close();
  } catch (error) {
    console.error(error);
    await bot.sendMessage(chatId, "Произошла ошибка при получении скриншота.");
  }

  await bot.sendMessage(
    chatId,
    "Нажмите на кнопку, чтобы получить скриншот главной страницы РБК",
    options
  );
});

// Создаем кнопку и отправляем ее пользователю
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    "Нажмите на кнопку, чтобы получить скриншот главной страницы РБК",
    options
  );
});
