import React from 'react';
import App from 'next/app';
import getConfig from 'next/config';
import WebviewClient, { useEventReducer } from '@machinat/webview/client';
import MessengerAuth from '@machinat/messenger/webview/client';
import TelegramAuth from '@machinat/telegram/webview/client';
import LineAuth from '@machinat/line/webview/client';
import { WebPushEvent } from '../../src/types';
import { WebAppData, SendWebActionFn } from '../types';

const { publicRuntimeConfig } = getConfig();

const client = new WebviewClient<
  MessengerAuth | TelegramAuth | LineAuth,
  WebPushEvent
>({
  mockupMode: typeof window === 'undefined',
  authPlatforms: [
    new MessengerAuth({
      pageId: publicRuntimeConfig.messengerPageId,
    }),
    new TelegramAuth({
      botName: publicRuntimeConfig.telegramBotName,
    }),
    new LineAuth({
      liffId: publicRuntimeConfig.lineLiffId,
    }),
  ],
});

const sendAction: SendWebActionFn = (action) => {
  client.send(action);
};

const closeWebview = () => client.closeWebview();

const PomodoroApp = ({ Component, pageProps }) => {
  React.useEffect(() => {
    client.send({ category: 'app', type: 'get_data', payload: null });
  }, []);

  const appData = useEventReducer<WebAppData | null>(
    client,
    (currentData, { event }) => {
      if (event.type === 'app_data') {
        return event.payload;
      }
      if (currentData && event.type === 'settings_updated') {
        return { ...currentData, settings: event.payload.settings };
      }
      return currentData;
    },
    null
  );

  return (
    <Component
      appData={appData}
      sendAction={sendAction}
      closeWebview={closeWebview}
      {...pageProps}
    />
  );
};

PomodoroApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default PomodoroApp;
