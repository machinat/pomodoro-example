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

const TimingPanel = ({ children }: TimingPanelProps, { platform }) => {
  const actionPause = encodePostbackData({ action: ACTION_PAUSE });
  const actionStop = encodePostbackData({ action: ACTION_STOP });

  switch (platform) {
    case 'messenger':
      return (
        <Messenger.ButtonTemplate
          buttons={
            <>
              <Messenger.PostbackButton
                title="Pause ⏸️"
                payload={actionPause}
              />
              <Messenger.PostbackButton title="Stop ⏹" payload={actionStop} />
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
              <Telegram.ReplyButton text="Pause ⏸️" />
              <Telegram.ReplyButton text="Stop ⏹" />
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
              <Line.PostbackAction displayText="Pause ⏸️" data={actionPause} />
              <Line.PostbackAction displayText="Stop ⏹" data={actionStop} />
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
