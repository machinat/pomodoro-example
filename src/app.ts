import Machinat from '@machinat/core';
import HTTP from '@machinat/http';

import Messenger from '@machinat/messenger';
import MessengerAssetsManager, {
  saveReusableAttachments,
} from '@machinat/messenger/asset';

import Line from '@machinat/line';
import LineAssetsManager from '@machinat/line/asset';

import Telegram from '@machinat/telegram';
import TelegramAssetsManager from '@machinat/telegram/asset';

import RedisState from '@machinat/redis-state';
import { FileState } from '@machinat/local-state';
import DialogFlow from '@machinat/dialogflow';
import YAML from 'yaml';

import Script from '@machinat/script';
import Pomodoro from './scenes/Pomodoro';
import SetUp from './scenes/SetUp';
import Starting from './scenes/Starting';
import Timing from './scenes/Timing';
import AskingTimezone from './scenes/AskingTimezone';
import useEventIntent from './utils/useEventIntent';
import Timer from './utils/Timer';

const {
  // location
  PORT,
  NODE_ENV,
  // messenger
  MESSENGER_PAGE_ID,
  MESSENGER_ACCESS_TOKEN,
  MESSENGER_APP_SECRET,
  MESSENGER_VERIFY_TOKEN,
  // line
  LINE_PROVIDER_ID,
  LINE_BOT_CHANNEL_ID,
  LINE_ACCESS_TOKEN,
  LINE_CHANNEL_SECRET,
  // telegram
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_SECRET_PATH,
  // dialogflow
  GOOGLE_APPLICATION_CREDENTIALS,
  DIALOG_FLOW_PROJECT_ID,
  DIALOG_FLOW_CLIENT_EMAIL,
  DIALOG_FLOW_PRIVATE_KEY,
  // redis
  REDIS_URL,
} = process.env as Record<string, string>;

const DEV = NODE_ENV !== 'production';

const app = Machinat.createApp({
  modules: [
    HTTP.initModule({
      listenOptions: {
        port: PORT ? Number(PORT) : 8080,
      },
    }),

    DEV
      ? FileState.initModule({
          path: './.state_storage',
        })
      : RedisState.initModule({
          clientOptions: {
            url: REDIS_URL as string,
          },
        }),

    Script.initModule({
      libs: [Pomodoro, SetUp, Starting, Timing, AskingTimezone],
    }),

    DialogFlow.initModule({
      projectId: DIALOG_FLOW_PROJECT_ID as string,
      gcpAuthConfig: GOOGLE_APPLICATION_CREDENTIALS
        ? undefined
        : {
            credentials: {
              client_email: DIALOG_FLOW_CLIENT_EMAIL,
              private_key: DIALOG_FLOW_PRIVATE_KEY,
            },
          },
      defaultLanguageCode: 'en-US',
    }),
  ],

  platforms: [
    Messenger.initModule({
      entryPath: '/webhook/messenger',
      pageId: MESSENGER_PAGE_ID as string,
      appSecret: MESSENGER_APP_SECRET,
      accessToken: MESSENGER_ACCESS_TOKEN,
      verifyToken: MESSENGER_VERIFY_TOKEN,
      optionalProfileFields: ['timezone'],
      dispatchMiddlewares: [saveReusableAttachments],
    }),

    Telegram.initModule({
      botToken: TELEGRAM_BOT_TOKEN,
      entryPath: '/webhook/telegram',
      secretPath: TELEGRAM_SECRET_PATH,
    }),

    Line.initModule({
      entryPath: '/webhook/line',
      providerId: LINE_PROVIDER_ID,
      channelId: LINE_BOT_CHANNEL_ID,
      accessToken: LINE_ACCESS_TOKEN,
      channelSecret: LINE_CHANNEL_SECRET,
    }),
  ],

  services: [
    LineAssetsManager,
    MessengerAssetsManager,
    TelegramAssetsManager,

    { provide: FileState.Serializer, withValue: YAML },

    Timer,
    useEventIntent,
  ],
});

export default app;
