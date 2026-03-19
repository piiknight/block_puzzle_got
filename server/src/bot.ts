import TelegramBot from 'node-telegram-bot-api';
import type { Express } from 'express';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || '';
const SERVER_URL = process.env.SERVER_URL || '';

let bot: TelegramBot | null = null;

export function setupBot(app: Express): TelegramBot | null {
  if (!BOT_TOKEN) {
    console.warn('BOT_TOKEN not set, bot disabled');
    return null;
  }

  // Webhook mode — no polling, server only wakes on incoming messages
  bot = new TelegramBot(BOT_TOKEN);

  // Register webhook endpoint
  const webhookPath = `/webhook/${BOT_TOKEN}`;
  app.post(webhookPath, (req, res) => {
    bot!.processUpdate(req.body);
    res.sendStatus(200);
  });

  // Set webhook URL at Telegram
  if (SERVER_URL) {
    bot.setWebHook(`${SERVER_URL}${webhookPath}`)
      .then(() => console.log(`Webhook set: ${SERVER_URL}${webhookPath}`))
      .catch(err => console.error('Failed to set webhook:', err.message));
  }

  // Bot commands
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || 'Player';

    bot!.sendMessage(chatId, `Hey ${firstName}! Tap the button below to play Block Blast!`, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'Play Block Blast',
            web_app: { url: WEBAPP_URL },
          },
        ]],
      },
    });
  });

  bot.onText(/\/leaderboard/, (msg) => {
    bot!.sendMessage(msg.chat.id, 'View the leaderboard in the game!', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'Leaderboard',
            web_app: { url: `${WEBAPP_URL}?view=leaderboard` },
          },
        ]],
      },
    });
  });

  bot.onText(/\/help/, (msg) => {
    bot!.sendMessage(msg.chat.id,
      '*Block Blast*\n\n' +
      'Drag and drop blocks onto the 8x8 grid.\n' +
      'Fill complete rows or columns to clear them!\n' +
      'Chain multiple clears for combo bonus.\n\n' +
      'Commands:\n' +
      '/start - Play the game\n' +
      '/leaderboard - View top scores\n' +
      '/help - Show this help',
      { parse_mode: 'Markdown' }
    );
  });

  console.log('Telegram bot started (webhook mode)');
  return bot;
}
