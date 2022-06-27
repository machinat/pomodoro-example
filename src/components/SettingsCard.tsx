import Sociably from '@sociably/core';
import { ACTION_OK, SETTINGS_PAGE } from '../constant';
import type { PomodoroSettings } from '../types';
import ButtonsCard, { ButtonData } from './ButtonsCard';

type SettingsCardProps = {
  settings: PomodoroSettings;
  noTitle?: boolean;
  withEditButton?: boolean;
  withOkButton?: boolean;
};

const SettingsCard = ({
  settings,
  noTitle = false,
  withEditButton = false,
  withOkButton = false,
}: SettingsCardProps) => {
  const settingsDesc = `${
    noTitle
      ? ''
      : `⚙️ Settings:
`
  }‣ 🍅 Time:   ${settings.workingMins} min
‣ Short Break: ${settings.shortBreakMins} min
‣ Long Break: ${settings.longBreakMins} min
‣ 🍅 per Day: ${settings.pomodoroPerDay}
‣ Timezone:  ${settings.timezone >= 0 ? '+' : ''}${settings.timezone}`;

  if (!withEditButton && !withOkButton) {
    return <p>{settingsDesc}</p>;
  }

  const buttons: ButtonData[] = [];
  if (withEditButton) {
    buttons.push({
      type: 'webview',
      text: 'Edit 📝',
      page: SETTINGS_PAGE,
    });
  }
  if (withOkButton) {
    buttons.push({ type: 'action', text: 'Ok 👍', action: ACTION_OK });
  }

  return (
    <ButtonsCard
      buttons={buttons}
      makeLineAltText={(template) =>
        `${template.text}\n\nTell me "Edit" to change`
      }
    >
      {settingsDesc}
    </ButtonsCard>
  );
};

export default SettingsCard;
