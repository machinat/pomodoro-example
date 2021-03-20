import main from './main';
import app from './app';
import Timer from './utils/Timer';

app.onError(console.error);
app
  .start()
  .then(() => {
    const [timer] = app.useServices([Timer]);
    timer.start();

    main(app);
  })
  .catch(console.error);

process.on('unhandledRejection', console.error);
