import { env } from '../config/env';
import { logger } from './logger';

const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Sends a real-time notification message to the configured Telegram Chat ID.
 */
export async function sendTelegramMessage(message: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    logger.warn('Telegram Bot Token or Chat ID is missing. Alert bypassed.');
    return;
  }

  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ errorText }, 'Failed response from Telegram API');
    } else {
      logger.info('Telegram notification dispatched successfully.');
    }
  } catch (error) {
    logger.error({ error }, 'Error calling Telegram Bot API');
  }
}