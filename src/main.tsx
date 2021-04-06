import Machinat from '@machinat/core';
import { makeContainer, ServiceScope } from '@machinat/core/service';
import BaseBot from '@machinat/core/base/Bot';
import Script from '@machinat/script';
import { fromApp, merge, Subject } from '@machinat/stream';
import { filter, tap } from '@machinat/stream/operators';
import Messenger from '@machinat/messenger';
import { MarkSeen } from '@machinat/messenger/components';
import { AnswerCallbackQuery } from '@machinat/telegram/components';

import Timer from './utils/Timer';
import Pomodoro from './scenes/Pomodoro';
import App from './app';
import type { AppEventContext } from './types';

const main = (app: typeof App): void => {
  const timer$ = new Subject<AppEventContext>();
  const [timer] = app.useServices([Timer]);

  timer.onTimesUp((targets) => {
    const [bot, scope] = app.useServices([BaseBot, ServiceScope]);

    for (const { channel } of targets) {
      const { platform } = channel;

      timer$.next({
        key: channel.uid,
        scope,
        value: {
          platform,
          event: {
            platform,
            category: 'timer',
            type: 'time_up',
            payload: null,
            channel,
            user: null,
          },
          metadata: { source: 'timer' },
          bot,
        },
      });
    }
  });

  const chat$ = fromApp(app);
  const event$ = merge(chat$, timer$);

  event$.pipe(
    tap<AppEventContext>(
      makeContainer({
        deps: [Machinat.BaseBot, Script.Processor, Messenger.Profiler] as const,
      })(
        (bot, scriptProcessor, messengerProfiler) => async (
          context: AppEventContext
        ) => {
          const { event } = context;
          const { channel } = event;
          if (!channel) {
            return;
          }

          let runtime = await scriptProcessor.continue(channel, context);
          if (!runtime) {
            let timezone: undefined | number;
            if (event.platform === 'messenger' && event.user) {
              ({ timezone } = await messengerProfiler.getUserProfile(
                event.user
              ));
            }

            runtime = await scriptProcessor.start(channel, Pomodoro, {
              params: { timezone },
            });
          }

          await bot.render(channel, runtime.output());
        }
      )
    )
  );

  chat$.pipe(
    filter(({ platform }) => platform === 'messenger'),
    tap(async ({ bot, event: { channel } }) => {
      await bot.render(channel, <MarkSeen />);
    })
  );

  chat$.pipe(
    filter(
      ({ event }) =>
        event.platform === 'telegram' && event.type === 'callback_query'
    ),
    tap(async ({ bot, event }) => {
      await bot.render(
        event.channel,
        <AnswerCallbackQuery queryId={event.queryId} />
      );
    })
  );
};

export default main;
