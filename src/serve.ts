import main from './main';
import app from './app';

app.onError(console.error);
app
  .start()
  .then(() => {
    main(app);
  })
  .catch(console.error);

process.on('unhandledRejection', console.error);
