import Machinat, { makeContainer, BasicBot } from '@machinat/core';
import Script from '@machinat/script';
import { merge, Stream } from '@machinat/stream';
import { filter, tap, map } from '@machinat/stream/operators';
import Messenger from '@machinat/messenger';
import { AnswerCallbackQuery } from '@machinat/telegram/components';
import * as Scenes from './scenes';
import Timer from './services/Timer';
import useIntent from './services/useIntent';
import useAppData from './services/useAppData';
import useSettings from './services/useSettings';
import useUserProfile from './services/useUserProfile';
import type {
  ChatEventContext,
  WebEventContext,
  AppEventContext,
  PomodoroEventContext,
} from './types';

type Scenes = typeof Scenes;

const main = (
  event$: Stream<ChatEventContext | WebEventContext>,
  timer$: Stream<AppEventContext>
): void => {
  const webview$ = event$.pipe(
    filter((ctx): ctx is WebEventContext => ctx.platform === 'webview')
  );

  // handle settings updates from webview
  const settingsUpdate$ = webview$.pipe(
    filter(
      (ctx): ctx is WebEventContext & { event: { type: 'update_settings' } } =>
        ctx.event.type === 'update_settings'
    ),
    map(
      makeContainer({ deps: [useSettings] })(
        (fetchSettings) =>
          async ({ event: { payload, channel }, metadata: { auth }, bot }) => {
            const newSettings = await fetchSettings(
              auth.channel,
              payload.settings
            );
            await bot.send(channel, {
              category: 'app',
              type: 'settings_updated',
              payload: { settings: newSettings },
            });
            return {
              platform: auth.platform,
              event: {
                platform: auth.platform,
                category: 'app',
                type: 'settings_updated',
                payload: { settings: newSettings },
                channel: auth.channel,
                user: auth.user,
              },
            };
          }
      )
    )
  );

  const appEvent$ = merge(settingsUpdate$, timer$);
  const chat$ = event$.pipe(
    filter((ctx): ctx is ChatEventContext => ctx.platform !== 'webview')
  );

  const pomodoroEvent$ = merge(chat$, appEvent$).pipe(
    map<AppEventContext, PomodoroEventContext>(
      makeContainer({ deps: [useIntent] })((getIntent) => async (ctx) => {
        const intent = await getIntent(ctx.event);
        return { ...ctx, intent };
      })
    )
  );
  pomodoroEvent$
    .pipe(
      tap(
        makeContainer({
          deps: [
            BasicBot,
            Script.Processor,
            Messenger.Profiler,
            Timer,
            useSettings,
            useAppData,
          ],
        })(
          (
              bot,
              scriptProcessor: Script.Processor<Scenes[keyof Scenes]>,
              messengerProfiler,
              timer,
              fetchSettings,
              fetchAppData
            ) =>
            async (context) => {
              const { event } = context;
              const { channel } = event;
              if (!channel) {
                return;
              }

              let runtime = await scriptProcessor.continue(channel, context);
              if (!runtime) {
                let timezone: undefined | number;
                if (event.user?.platform === 'messenger') {
                  try {
                    const profile = await messengerProfiler.getUserProfile(
                      event.user
                    );
                    timezone = profile?.timeZone;
                  } catch {}
                }

                const settings = await fetchSettings(
                  channel,
                  timezone !== undefined ? { timezone } : null
                );

                runtime = await scriptProcessor.start(
                  channel,
                  Scenes.Pomodoro,
                  { params: { settings } }
                );
              }

              const { yieldValue } = runtime;
              if (yieldValue) {
                const {
                  updateSettings,
                  registerTimer,
                  cancelTimer,
                  recordPomodoro,
                } = yieldValue;

                await Promise.all([
                  updateSettings && fetchSettings(channel, updateSettings),
                  registerTimer && timer.registerTimer(channel, registerTimer),
                  cancelTimer && timer.cancelTimer(channel, cancelTimer),
                  recordPomodoro &&
                    fetchAppData(channel, ({ settings, statistics }) => ({
                      settings,
                      statistics: {
                        ...statistics,
                        records: [...statistics.records, recordPomodoro],
                      },
                    })),
                ]);
              }

              await bot.render(channel, runtime.output());
            }
        )
      )
    )
    .catch(console.error);

  // push web app data when connect
  webview$.pipe(
    filter(
      (ctx): ctx is WebEventContext & { event: { type: 'connect' } } =>
        ctx.event.type === 'connect'
    ),
    tap(
      makeContainer({ deps: [useAppData, useUserProfile] })(
        (getAppData, getUserProfile) =>
          async ({ bot, event, metadata: { auth } }) => {
            const [{ settings, statistics }, userProfile] = await Promise.all([
              getAppData(auth.channel),
              getUserProfile(auth.user),
            ]);
            await bot.send(event.channel, {
              category: 'app',
              type: 'app_data',
              payload: { settings, statistics, userProfile },
            });
          }
      )
    )
  );

  // answer callback_query event in Telegram
  event$
    .pipe(
      filter(
        (
          ctx
        ): ctx is ChatEventContext & { event: { type: 'callback_query' } } =>
          ctx.event.type === 'callback_query'
      ),
      tap(async ({ event, reply }) => {
        await reply(<AnswerCallbackQuery queryId={event.queryId} />);
      })
    )
    .catch(console.error);
};

export default main;
