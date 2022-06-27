import Sociably from '@sociably/core';
import HTTP from '@sociably/http';
import Messenger from '@sociably/messenger';
import MessengerAuth from '@sociably/messenger/webview';
import Line from '@sociably/line';
import LineAuth from '@sociably/line/webview';
import Telegram from '@sociably/telegram';
import TelegramAuth from '@sociably/telegram/webview';
import Webview from '@sociably/webview';
import RedisState from '@sociably/redis-state';
import { FileState } from '@sociably/dev-tools';
import DialogFlow from '@sociably/dialogflow';
import Script from '@sociably/script';
import nextConfigs from '../webview/next.config.js';
import recognitionData from './recognitionData';
import * as scenesScirpts from './scenes';
import useIntent from './services/useIntent';
import useAppData from './services/useAppData';
import useSettings from './services/useSettings';
import useUserProfile from './services/useUserProfile';
import Timer from './services/Timer';
import { WebviewAction } from './types';

const {
  // basic
  APP_NAME,
  PORT,
  DOMAIN,
  NODE_ENV,
  // messenger
  MESSENGER_PAGE_ID,
  MESSENGER_ACCESS_TOKEN,
  MESSENGER_APP_SECRET,
  MESSENGER_VERIFY_TOKEN,
  // line
  LINE_PROVIDER_ID,
  LINE_CHANNEL_ID,
  LINE_ACCESS_TOKEN,
  LINE_CHANNEL_SECRET,
  LINE_LIFF_ID,
  // telegram
  TELEGRAM_BOT_NAME,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_SECRET_PATH,
  // dialogflow
  GOOGLE_APPLICATION_CREDENTIALS,
  DIALOG_FLOW_PROJECT_ID,
  DIALOG_FLOW_CLIENT_EMAIL,
  DIALOG_FLOW_PRIVATE_KEY,
  // webview
  WEBVIEW_AUTH_SECRET,
  // redis
  REDIS_URL,
} = process.env as Record<string, string>;

const DEV = NODE_ENV !== 'production';

type CreateAppOptions = {
  noServer?: boolean;
};

const createApp = ({ noServer = false }: CreateAppOptions = {}) => {
  const app = Sociably.createApp({
    modules: [
      HTTP.initModule({
        noServer,
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
              url: REDIS_URL,
            },
          }),

      Script.initModule({
        libs: Object.values(scenesScirpts),
      }),

      DialogFlow.initModule({
        recognitionData,
        projectId: DIALOG_FLOW_PROJECT_ID,
        environment: `sociably-pomodoro-${DEV ? 'dev' : 'prod'}`,
        clientOptions: GOOGLE_APPLICATION_CREDENTIALS
          ? undefined
          : {
              credentials: {
                client_email: DIALOG_FLOW_CLIENT_EMAIL,
                private_key: DIALOG_FLOW_PRIVATE_KEY,
              },
            },
      }),
    ],

    platforms: [
      Messenger.initModule({
        webhookPath: '/webhook/messenger',
        pageId: MESSENGER_PAGE_ID,
        appSecret: MESSENGER_APP_SECRET,
        accessToken: MESSENGER_ACCESS_TOKEN,
        verifyToken: MESSENGER_VERIFY_TOKEN,
        optionalProfileFields: ['timezone'],
      }),

      Telegram.initModule({
        webhookPath: '/webhook/telegram',
        botName: TELEGRAM_BOT_NAME,
        botToken: TELEGRAM_BOT_TOKEN,
        secretPath: TELEGRAM_SECRET_PATH,
      }),

      Line.initModule({
        webhookPath: '/webhook/line',
        providerId: LINE_PROVIDER_ID,
        channelId: LINE_CHANNEL_ID,
        accessToken: LINE_ACCESS_TOKEN,
        channelSecret: LINE_CHANNEL_SECRET,
        liffId: LINE_LIFF_ID,
      }),

      Webview.initModule<
        MessengerAuth | TelegramAuth | LineAuth,
        WebviewAction
      >({
        webviewHost: DOMAIN,
        webviewPath: '/webview',

        authSecret: WEBVIEW_AUTH_SECRET,
        authPlatforms: [MessengerAuth, TelegramAuth, LineAuth],
        cookieSameSite: 'none',
        basicAuth: {
          appName: APP_NAME,
          appIconUrl: 'https://sociably.js.org/img/logo.jpg',
        },

        noNextServer: noServer,
        nextServerOptions: {
          dev: DEV,
          dir: './webview',
          conf: nextConfigs,
        },
      }),
    ],

    services: [Timer, useIntent, useAppData, useSettings, useUserProfile],
  });

  return app;
};

export default createApp;
