import Machinat from '@machinat/core';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import encodePostbackData from '../utils/encodePostbackData';
import { ACTION_OK, ACTION_SET_UP } from '../constant';
import type { PomodoroSettings } from '../types';

type SettingsPanelProps = {
  settings: PomodoroSettings;
};

const SettingsPanel = ({ settings }: SettingsPanelProps, { platform }) => {
  const currentSettingsWords = `Current Settings:
- Pomodoro Time: ${settings.workingMins} min
- Short Break Time: ${settings.shortBreakMins} min
- Long Break Time: ${settings.longBreakMins} min
- Pomodoro per Day: ${settings.pomodoroPerDay}
- Timezone: ${settings.timezone >= 0 ? '+' : ''}${settings.timezone}
`;

  const setupAction = encodePostbackData({ action: ACTION_SET_UP });
  const okAction = encodePostbackData({ action: ACTION_OK });

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
              <Telegram.CallbackButton text="Edit" data={setupAction} />
              <Telegram.CallbackButton text="Ok" data={okAction} />
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
              <Line.PostbackAction
                label="Edit"
                displayText="Edit"
                data={setupAction}
              />
              <Line.PostbackAction
                label="Ok"
                displayText="Ok"
                data={okAction}
              />
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
