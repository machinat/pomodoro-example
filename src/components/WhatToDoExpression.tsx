import Machinat from '@machinat/core';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import { ACTION_OK, ACTION_SETTINGS, ACTION_ABOUT } from '../constant';

const WhatToDoExpression = ({ children }, { platform }) => {
  switch (platform) {
    case 'messenger':
      return (
        <Messenger.Expression
          quickReplies={
            <>
              <Messenger.QuickReply title="Continue" payload={ACTION_OK} />
              <Messenger.QuickReply
                title="Change Settings"
                payload={ACTION_SETTINGS}
              />
              <Messenger.QuickReply
                title="What's this?"
                payload={ACTION_ABOUT}
              />
            </>
          }
        >
          {children}
        </Messenger.Expression>
      );

    case 'telegram':
      return (
        <Telegram.Expression
          replyMarkup={
            <Telegram.InlineKeyboard>
              <Telegram.CallbackButton text="Continue" data={ACTION_OK} />
              <Telegram.CallbackButton
                text="Change Settings"
                data={ACTION_SETTINGS}
              />
              <Telegram.CallbackButton
                text="What's this?"
                data={ACTION_ABOUT}
              />
            </Telegram.InlineKeyboard>
          }
        >
          {children}
        </Telegram.Expression>
      );

    case 'line':
      return (
        <Line.Expression
          quickReplies={
            <>
              <Line.QuickReply>
                <Line.PostbackAction displayText="Continue" data={ACTION_OK} />
                <Line.PostbackAction
                  displayText="Change Settings"
                  data={ACTION_SETTINGS}
                />
                <Line.PostbackAction
                  displayText="What's this?"
                  data={ACTION_ABOUT}
                />
              </Line.QuickReply>
            </>
          }
        >
          {children}
        </Line.Expression>
      );

    default:
      return children;
  }
};

export default WhatToDoExpression;
