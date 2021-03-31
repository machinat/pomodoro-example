import Machinat from '@machinat/core';
import { MachinatNode } from '@machinat/core/types';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import encodePostbackData from '../utils/encodePostbackData';
import { AppActionType } from '../types';

type TwoButtonPanelProps = {
  children: MachinatNode;
  text1: string;
  text2: string;
  action1: AppActionType;
  action2: AppActionType;
  makeLineAltText: (template: Record<string, unknown>) => string;
};

const TwoButtonPanel = (
  {
    children,
    text1,
    text2,
    action1,
    action2,
    makeLineAltText,
  }: TwoButtonPanelProps,
  { platform }
) => {
  const data1 = encodePostbackData({ action: action1 });
  const data2 = encodePostbackData({ action: action2 });

  switch (platform) {
    case 'messenger':
      return (
        <Messenger.ButtonTemplate
          buttons={
            <>
              <Messenger.PostbackButton title={text1} payload={data1} />
              <Messenger.PostbackButton title={text2} payload={action2} />
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
            <Telegram.ReplyKeyboard resizeKeyboard>
              <Telegram.KeyboardRow>
                <Telegram.TextReply text={text1} />
                <Telegram.TextReply text={text2} />
              </Telegram.KeyboardRow>
            </Telegram.ReplyKeyboard>
          }
        >
          {children}
        </Telegram.Text>
      );

    case 'line':
      return (
        <Line.ButtonTemplate
          altText={makeLineAltText}
          actions={
            <>
              <Line.PostbackAction label={text1} data={data1} />
              <Line.PostbackAction
                label={text2}
                displayText={text2}
                data={data2}
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

export default TwoButtonPanel;
