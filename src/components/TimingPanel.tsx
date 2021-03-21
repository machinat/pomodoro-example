import Machinat from '@machinat/core';
import { MachinatNode } from '@machinat/core/types';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import encodePostbackData from '../utils/encodePostbackData';
import { ACTION_PAUSE, ACTION_STOP } from '../constant';

type TimingPanelProps = {
  children: MachinatNode;
};

const STOP = 'Stop ⏹';
const PAUSE = 'Pause ⏸️';

const TimingPanel = ({ children }: TimingPanelProps, { platform }) => {
  const actionPause = encodePostbackData({ action: ACTION_PAUSE });
  const actionStop = encodePostbackData({ action: ACTION_STOP });

  switch (platform) {
    case 'messenger':
      return (
        <Messenger.ButtonTemplate
          buttons={
            <>
              <Messenger.PostbackButton title={PAUSE} payload={actionPause} />
              <Messenger.PostbackButton title={STOP} payload={actionStop} />
            </>
          }
        >
          {children}
        </Messenger.ButtonTemplate>
      );

    case 'telegram':
      return (
        <Telegram.Text
          replyMarkup={
            <Telegram.InlineKeyboard>
              <Telegram.CallbackButton text={PAUSE} data={actionPause} />
              <Telegram.CallbackButton text={STOP} data={actionStop} />
            </Telegram.InlineKeyboard>
          }
        >
          {children}
        </Telegram.Text>
      );

    case 'line':
      return (
        <Line.ButtonTemplate
          altText={(template) =>
            `${template.text}\n\nYou can tell me to "Pause" or "Start"`
          }
          actions={
            <>
              <Line.PostbackAction label={PAUSE} data={actionPause} />
              <Line.PostbackAction
                label={STOP}
                displayText={STOP}
                data={actionStop}
              />
            </>
          }
        >
          {children}
        </Line.ButtonTemplate>
      );

    default:
      return <>{children}</>;
  }
};

export default TimingPanel;
