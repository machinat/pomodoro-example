import Machinat from '@machinat/core';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import { ACTION_OK, ACTION_SETTINGS, ACTION_ABOUT } from '../constant';

const CONTINUE = 'Continue';
const CHANGE_SETTINGS = 'Change Settings';
const WHATS_THIS = "What's this?";

const WhatToDoExpression = ({ children }, { platform }) => {
  switch (platform) {
    case 'messenger':
      return (
        <Messenger.Expression
          quickReplies={
            <>
              <Messenger.TextReply title={CONTINUE} payload={ACTION_OK} />
              <Messenger.TextReply
                title={CHANGE_SETTINGS}
                payload={ACTION_SETTINGS}
              />
              <Messenger.TextReply title={WHATS_THIS} payload={ACTION_ABOUT} />
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
              <Telegram.CallbackButton text={CONTINUE} data={ACTION_OK} />
              <Telegram.CallbackButton
                text={CHANGE_SETTINGS}
                data={ACTION_SETTINGS}
              />
              <Telegram.CallbackButton text={WHATS_THIS} data={ACTION_ABOUT} />
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
                <Line.PostbackAction
                  label={CONTINUE}
                  displayText={CONTINUE}
                  data={ACTION_OK}
                />
                <Line.PostbackAction
                  label={CHANGE_SETTINGS}
                  displayText={CHANGE_SETTINGS}
                  data={ACTION_SETTINGS}
                />
                <Line.PostbackAction
                  label={WHATS_THIS}
                  displayText={WHATS_THIS}
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
