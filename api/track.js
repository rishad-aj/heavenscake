import { addLog } from '../../lib/storage';
import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = '7242943097:AAEB1MO7nQKbVRS9P3xs3_ALv8PFrYUrbS8';
const CHAT_ID = '7216371031';
const bot = new TelegramBot(BOT_TOKEN);

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  addLog(ip);
  await bot.sendMessage(CHAT_ID, `👤 New visitor: ${ip}`);
  res.status(200).send('OK');
}