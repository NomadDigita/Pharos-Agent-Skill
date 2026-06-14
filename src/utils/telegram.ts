import { env } from '../config/env';
import { logger } from './logger';

const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Sends real-time notification messages to all configured Telegram Chat IDs in parallel.
 */
export async function sendTelegramMessage(message: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    logger.warn('Telegram Bot Token or Chat ID configuration is missing. Alert bypassed.');
    return;
  }

  // Parse comma-separated list of Chat IDs
  const chatIds = TELEGRAM_CHAT_ID.split(',').map((id) => id.trim()).filter((id) => id.length > 0);

  if (chatIds.length === 0) {
    logger.warn('No valid Chat IDs resolved from configuration.');
    return;
  }

  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  // Dispatch requests in parallel
  const sendPromises = chatIds.map(async (chatId) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ chatId, errorText }, 'Failed response from Telegram API for specific chat');
      } else {
        logger.info({ chatId }, 'Telegram notification successfully dispatched to account');
      }
    } catch (error) {
      logger.error({ chatId, error }, 'Error calling Telegram Bot API for specific chat');
    }
  });

  await Promise.all(sendPromises);
}