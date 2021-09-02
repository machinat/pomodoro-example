import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import Script from '@machinat/script';
import { merge, Stream } from '@machinat/stream';
import { filter, tap } from '@machinat/stream/operators';
import Messenger, { MessengerEventContext } from '@machinat/messenger';
import { MarkSeen } from '@machinat/messenger/components';
import { AnswerCallbackQuery } from '@machinat/telegram/components';
import Pomodoro from './scenes/Pomodoro';
import type {
  ChatEventContext,
  TimerEventContext,
  AppEventContext,
} from './types';

const main = (
  chat$: Stream<ChatEventContext>,
  timer$: Stream<TimerEventContext>
): void => {
  const event$ = merge<AppEventContext>(chat$, timer$);

  event$
    .pipe(
      tap<AppEventContext>(
        makeContainer({
          deps: [Machinat.Bot, Script.Processor, Messenger.Profiler] as const,
        })(
          (bot, scriptProcessor, messengerProfiler) =>
            async (context: AppEventContext) => {
              const { event } = context;
              const { channel } = event;
              if (!channel) {
                return;
              }

              let runtime = await scriptProcessor.continue(channel, context);
              if (!runtime) {
                let timezone: undefined | number;

                if (event.platform === 'messenger' && event.user) {
                  try {
                    const profile = await messengerProfiler.getUserProfile(
                      event.user
                    );
                    timezone = profile?.timezone;
                  } catch {}
                }

                runtime = await scriptProcessor.start(channel, Pomodoro, {
                  params: { timezone },
                });
              }

              await bot.render(channel, runtime.output());
            }
        )
      )
    )
    .catch(console.error);

  chat$
    .pipe(
      filter(
        (
          ctx
        ): ctx is MessengerEventContext & { event: { category: 'message' } } =>
          ctx.platform === 'messenger' && ctx.event.category === 'message'
      ),
      tap(async ({ reply }) => {
        await reply(<MarkSeen />);
      })
    )
    .catch(console.error);

  chat$
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
