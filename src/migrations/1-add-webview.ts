import { makeContainer } from '@machinat/core';
import Messenger from '@machinat/messenger';
import Telegram from '@machinat/telegram';
import Line from '@machinat/line';

const { DOMAIN } = process.env;

const ENTRY_URL = `https://${DOMAIN}`;

export const up = makeContainer({
  deps: [Messenger.Bot, Telegram.Bot, Line.Bot],
})(async (messengerBot, telegramBot) => {
  // register domain
  await messengerBot.makeApiCall('POST', 'me/messenger_profile', {
    whitelisted_domains: [ENTRY_URL],
  });

  // add persistent buttons to open webview
  await messengerBot.makeApiCall('POST', 'me/messenger_profile', {
    persistent_menu: [
      {
        locale: 'default',
        composer_input_disabled: false,
        call_to_actions: [
          {
            type: 'web_url',
            title: 'Edit Settings ⚙️',
            url: `${ENTRY_URL}/webview/settings?platform=messenger`,
            webview_height_ratio: 'full',
            messenger_extensions: true,
          },
          {
            type: 'web_url',
            title: 'Statistics 📊',
            url: `${ENTRY_URL}/webview/statistics?platform=messenger`,
            webview_height_ratio: 'full',
            messenger_extensions: true,
          },
        ],
      },
    ],
  });

  // add command for telegram bot
  await telegramBot.makeApiCall('setMyCommands', {
    commands: [
      { command: 'settings', description: 'Settings ⚙️' },
      { command: 'statistics', description: 'Statistics  📊' },
      { command: 'skip', description: 'Skip  ⏹' },
      { command: 'pause', description: 'Pause  ⏸️' },
      { command: 'start', description: 'Start  ▶️' },
    ],
  });
});

export const down = makeContainer({
  deps: [Messenger.Bot, Telegram.Bot],
})(async (messengerBot, telegramBot) => {
  // clear page profile in Messenger
  await messengerBot.makeApiCall('DELETE', 'me/messenger_profile', {
    fields: ['whitelisted_domains', 'persistent_menu'],
  });

  // clear commands of the Telegram bot
  await telegramBot.makeApiCall('setMyCommands', { commands: [] });
});
