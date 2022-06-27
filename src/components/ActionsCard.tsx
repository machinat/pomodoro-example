import Sociably, { SociablyNode } from '@sociably/core';
import * as Messenger from '@sociably/messenger/components';
import * as Telegram from '@sociably/telegram/components';
import * as Line from '@sociably/line/components';
import encodePostbackData from '../utils/encodePostbackData';
import { AppActionType } from '../types';

type ActionButtonData = {
  text: string;
  type: AppActionType;
};

type ActionsCardProps = {
  children: SociablyNode;
  actions: ActionButtonData[];
  makeLineAltText: (template: Record<string, unknown>) => string;
};

const encodeActionType = (type) => encodePostbackData({ action: type });

/**
 * This component use ReplyKeyboard in Telegram. If you don't need it, use the
 * ButtonsCard component.
 */
const ActionsCard = (
  { children, actions, makeLineAltText }: ActionsCardProps,
  { platform }
) => {
  switch (platform) {
    case 'messenger':
      return (
        <Messenger.ButtonTemplate
          buttons={actions.map((action) => (
            <Messenger.PostbackButton
              title={action.text}
              payload={encodeActionType(action.type)}
            />
          ))}
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
                {actions.map((action) => (
                  <Telegram.TextReply text={action.text} />
                ))}
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
          actions={actions.map((action) => (
            <Line.PostbackAction
              label={action.text}
              data={encodeActionType(action.type)}
            />
          ))}
        >
          {children}
        </Line.ButtonTemplate>
      );

    default:
      return <>{children}</>;
  }
};

export default ActionsCard;
