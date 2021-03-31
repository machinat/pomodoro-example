import Machinat from '@machinat/core';
import { ACTION_OK, ACTION_SET_UP } from '../constant';
import type { PomodoroSettings } from '../types';
import TwoButtonPanel from './TwoButtonPanel';

type SettingsPanelProps = {
  settings: PomodoroSettings;
};

const SettingsPanel = ({ settings }: SettingsPanelProps, { platform }) => {
  return (
    <TwoButtonPanel
      text1="Edit"
      action1={ACTION_SET_UP}
      text2="Ok"
      action2={ACTION_OK}
      makeLineAltText={(template) =>
        `${template.text}\n\nTell me "Edit" to change`
      }
    >
      {`Current Settings:
- Pomodoro Time: ${settings.workingMins} min
- Short Break Time: ${settings.shortBreakMins} min
- Long Break Time: ${settings.longBreakMins} min
- Pomodoro per Day: ${settings.pomodoroPerDay}
- Timezone: ${settings.timezone >= 0 ? '+' : ''}${settings.timezone}`}
    </TwoButtonPanel>
  );
};

export default SettingsPanel;
