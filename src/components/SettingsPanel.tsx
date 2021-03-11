import Machinat from '@machinat/core';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import encodePostbackData from '../utils/encodePostbackData';
import { ACTION_GO, ACTION_SET_UP } from '../constant';
import type { PomodoroSettings } from '../types';

type SettingsPanelProps = {
  settings: PomodoroSettings;
};

const SettingsPanel = ({ settings }: SettingsPanelProps, { platform }) => {
  const currentSettingsWords = `Current Settings:
- Pomodoro Time: ${settings.pomodoroTime} min
- Short Break Time: ${settings.shortBreakTime} min
- Long Break Time: ${settings.longBreakTime} min
- Pomodoro per Day: ${settings.pomodoroPerDay}
`;

  const setupAction = encodePostbackData({ action: ACTION_SET_UP });
  const okAction = encodePostbackData({ action: ACTION_GO });

  switch (platform) {
    case 'messenger':
      return (
        <Messenger.ButtonTemplate
          buttons={
            <>
              <Messenger.PostbackButton title="Edit" payload={setupAction} />
              <Messenger.PostbackButton title="Ok" payload={okAction} />
            </>
          }
        >
          {currentSettingsWords}
        </Messenger.ButtonTemplate>
      );

    case 'telegram':
      return (
        <Telegram.Text
          replyMarkup={
            <Telegram.InlineKeyboard>
              <Telegram.ReplyButton text="Edit" />
              <Telegram.ReplyButton text="Ok" />
            </Telegram.InlineKeyboard>
          }
        >
          {currentSettingsWords}
        </Telegram.Text>
      );

    case 'line':
      return (
        <Line.ButtonTemplate
          altText={currentSettingsWords}
          actions={
            <>
              <Line.PostbackAction displayText="Edit" data={setupAction} />
              <Line.PostbackAction displayText="Ok" data={okAction} />
            </>
          }
        >
          {currentSettingsWords}
        </Line.ButtonTemplate>
      );

    default:
      return <>{currentSettingsWords}</>;
  }
};

export default SettingsPanel;
