import { getLogs } from '../../lib/storage';
import moment from 'moment';
import TelegramBot from 'node-telegram-bot-api';

const TOKEN = '7242943097:AAEB1MO7nQKbVRS9P3xs3_ALv8PFrYUrbS8';
const bot = new TelegramBot(TOKEN);

let awaitingDate = {};

export default async function handler(req, res) {
  const body = req.body;

  if (body.message) {
    const msg = body.message;
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (text === '/start') {
      const logs = getLogs();
      const uniqueIPs = [...new Set(logs.map(l => l.ip))];
      await bot.sendMessage(chatId, `📊 Total unique visitors: ${uniqueIPs.length}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📅 View by Date', callback_data: 'view_by_date' }]
          ]
        }
      });
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(text) && awaitingDate[chatId]) {
      const date = text;
      const logs = getLogs();
      const dayLogs = logs.filter(l => l.date === date);
      await bot.sendMessage(chatId, `📅 Total visitors on ${date}: ${dayLogs.length}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '👁️ View Users', callback_data: `view_users:${date}` }]
          ]
        }
      });
      awaitingDate[chatId] = false;
    }
  }

  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.message.chat.id;

    if (query.data === 'view_by_date') {
      awaitingDate[chatId] = true;
      await bot.sendMessage(chatId, '📅 Send a date like: DD/MM/YYYY');
    }

    if (query.data.startsWith('view_users:')) {
      const selectedDate = query.data.split(':')[1];
      const logs = getLogs();
      const year = moment(selectedDate, 'DD/MM/YYYY').year();

      const userMap = {};
      logs.filter(l => l.date === selectedDate).forEach(log => {
        if (!userMap[log.ip]) userMap[log.ip] = { day: 0, year: 0 };
        userMap[log.ip].day++;
      });

      logs.forEach(log => {
        if (moment(log.date, 'DD/MM/YYYY').year() === year && userMap[log.ip]) {
          userMap[log.ip].year++;
        }
      });

      let text = `👁️ Users on ${selectedDate}:

`;
      Object.entries(userMap).forEach(([ip, stats], i) => {
        text += `${i + 1}. ${ip} — ${stats.day} that day, ${stats.year} this year\n`;
      });

      await bot.sendMessage(chatId, text);
    }

    await bot.answerCallbackQuery(query.id);
  }

  res.status(200).send('OK');
}