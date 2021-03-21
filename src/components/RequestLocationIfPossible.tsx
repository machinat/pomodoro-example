import Machinat from '@machinat/core';
import { MachinatNode } from '@machinat/core/types';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';

type RequestLocationIfPossibleProps = {
  children: MachinatNode;
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
                <Telegram.ReplyButton text="Send Location" requestLocation />
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
