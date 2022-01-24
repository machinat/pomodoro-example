import { ServiceScope } from '@machinat/core/service';
import { Stream, fromApp } from '@machinat/stream';
import main from './main';
import createApp from './app';
import Timer from './services/Timer';
import { AppEventContext, ChatEventContext, WebEventContext } from './types';

const app = createApp();
app.onError(console.error);
app
  .start()
  .then(() => {
    const timer$ = new Stream<AppEventContext>();
    const [timer] = app.useServices([Timer]);
    timer.start();

    timer.onTimesUp((targets) => {
      const [scope] = app.useServices([ServiceScope]);

      for (const { channel } of targets) {
        const { platform } = channel;
        timer$.next({
          key: channel.uid,
          scope,
          value: {
            platform,
            event: {
              platform,
              category: 'app',
              type: 'time_up',
              payload: null,
              channel,
              user: null,
            },
          },
        });
      }
    });

    main(fromApp(app) as Stream<ChatEventContext | WebEventContext>, timer$);
  })
  .catch(console.error);

process.on('unhandledRejection', console.error);
