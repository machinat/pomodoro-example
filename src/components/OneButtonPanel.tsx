import Machinat, { MachinatNode } from '@machinat/core';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import encodePostbackData from '../utils/encodePostbackData';
import { AppActionType } from '../types';

type OneButtonPanelProps = {
  children: MachinatNode;
  text: string;
  action: AppActionType;
  makeLineAltText: (template: Record<string, unknown>) => string;
};

const OneButtonPanel = (
  { children, text, action, makeLineAltText }: OneButtonPanelProps,
  { platform }
) => {
  const actionData = encodePostbackData({ action });

  switch (platform) {
    case 'messenger':
      return (
        <Messenger.ButtonTemplate
          buttons={
            <Messenger.PostbackButton title={text} payload={actionData} />
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
              <Telegram.TextReply text={text} />
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
            <Line.PostbackAction
              label={text}
              displayText={text}
              data={actionData}
            />
          }
        >
          {children}
        </Line.ButtonTemplate>
      );

    default:
      return <>{children}</>;
  }
};

export default OneButtonPanel;
