import type { MachinatApp } from '@machinat/core/types';
import Messenger from '@machinat/messenger';
import Telegram from '@machinat/telegram';
import encodePostbackData from '../utils/encodePostbackData';
import { ACTION_MESSENGER_GETTING_START } from '../constant';

const { HOST, TELEGRAM_SECRET_PATH } = process.env;

const ENTRY_URL = `https://${HOST}`;

export const up = async (app: MachinatApp<any>) => {
  const [messengerBot, telegramBot] = app.useServices([
    Messenger.Bot,
    Telegram.Bot,
  ] as const);

  await messengerBot.makeApiCall('POST', 'me/messenger_profile', {
    whitelisted_domains: [ENTRY_URL],
    get_started: {
      payload: encodePostbackData({ action: ACTION_MESSENGER_GETTING_START }),
    },
    greeting: [
      {
        locale: 'default',
        text: '🍅 Pomodoro Bot 🤖',
      },
    ],
  });

  telegramBot.makeApiCall('setWebhook', {
    url: `${ENTRY_URL}/webhook/telegram/${TELEGRAM_SECRET_PATH}`,
  });
};

export const down = async (app: MachinatApp<any>) => {
  const [messengerBot, telegramBot] = app.useServices([
    Messenger.Bot,
    Telegram.Bot,
  ] as const);

  await messengerBot.makeApiCall('DELETE', 'me/messenger_profile', {
    fields: ['get_started', 'greeting', 'persistent_menu'],
  });

  telegramBot.makeApiCall('deleteWebhook');
};
