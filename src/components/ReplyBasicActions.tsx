import Machinat, { MachinatNode } from '@machinat/core';
import {
  ACTION_ABOUT,
  ACTION_CHECK_SETTINGS,
  ACTION_SETTINGS_UPDATED,
} from '../constant';
import type { AppEventIntent, PomodoroSettings } from '../types';
import About from './About';
import SettingsCard from './SettingsCard';

type ReplyBasicActionsProps = {
  intent: AppEventIntent;
  settings: PomodoroSettings;
  defaultReply?: MachinatNode;
};

const ReplyBasicActions = ({
  intent,
  settings,
  defaultReply = null,
}: ReplyBasicActionsProps) => {
  if (intent.type === ACTION_ABOUT) {
    return <About />;
  }
  if (intent.type === ACTION_CHECK_SETTINGS) {
    return <SettingsCard withEditButton settings={settings} />;
  }
  if (intent.type === ACTION_SETTINGS_UPDATED) {
    return (
      <>
        <p>Your settings is updated ⚙️</p>
        <SettingsCard noTitle withEditButton settings={settings} />
      </>
    );
  }
  return <>{defaultReply}</>;
};

export default ReplyBasicActions;
