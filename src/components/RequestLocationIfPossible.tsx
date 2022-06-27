import Sociably, { SociablyNode } from '@sociably/core';
import * as Telegram from '@sociably/telegram/components';
import * as Line from '@sociably/line/components';

type RequestLocationIfPossibleProps = {
  children: SociablyNode;
  makeLineAltText: (template: Record<string, unknown>) => string;
};

const RequestLocationIfPossible = (
  { children, makeLineAltText }: RequestLocationIfPossibleProps,
  { platform }
) => {
  switch (platform) {
    case 'telegram':
      return (
        <Telegram.Text
          replyMarkup={
            <Telegram.ReplyKeyboard oneTimeKeyboard resizeKeyboard>
              <Telegram.KeyboardRow>
                <Telegram.LocationReply text="Send Location" />
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
          actions={<Line.LocationAction label="Send Location" />}
        >
          {children}
        </Line.ButtonTemplate>
      );

    default:
      return <>{children}</>;
  }
};

export default RequestLocationIfPossible;
