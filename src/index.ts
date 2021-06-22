import { ServiceScope } from '@machinat/core/service';
import BaseBot from '@machinat/core/base/Bot';
import { Stream, fromApp } from '@machinat/stream';
import main from './main';
import app from './app';
import Timer from './services/Timer';
import { TimerEventContext } from './types';

app.onError(console.error);
app
  .start()
  .then(() => {
    const timer$ = new Stream<TimerEventContext>();
    const [timer] = app.useServices([Timer]);
    timer.start();

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

    main(fromApp(app), timer$);
  })
  .catch(console.error);

process.on('unhandledRejection', console.error);
