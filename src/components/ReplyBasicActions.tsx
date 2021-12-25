import Machinat, { MachinatNode } from '@machinat/core';
import {
  ACTION_ABOUT,
  ACTION_CHECK_SETTINGS,
  ACTION_SETTINGS_UPDATED,
  ACTION_CHECK_STATISTICS,
} from '../constant';
import type { AppActionType, PomodoroSettings, AppChannel } from '../types';
import About from './About';
import SettingsCard from './SettingsCard';
import StatisticsCard from './StatisticsCard';

type ReplyBasicActionsProps = {
  channel: AppChannel;
  action: AppActionType;
  settings: PomodoroSettings;
  defaultReply?: MachinatNode;
};

const ReplyBasicActions = ({
  channel,
  action,
  settings,
  defaultReply = null,
}: ReplyBasicActionsProps) => {
  if (action === ACTION_ABOUT) {
    return <About />;
  }
  if (action === ACTION_CHECK_SETTINGS) {
    return <SettingsCard withEditButton settings={settings} />;
  }
  if (action === ACTION_SETTINGS_UPDATED) {
    return (
      <>
        <p>Your settings is updated ⚙️</p>
        <SettingsCard noTitle withEditButton settings={settings} />
      </>
    );
  }
  if (action === ACTION_CHECK_STATISTICS) {
    return <StatisticsCard channel={channel} />;
  }
  return <>{defaultReply}</>;
};

export default ReplyBasicActions;
