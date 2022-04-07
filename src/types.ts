import type { MachinatProfile } from '@machinat/core';
import type { MessengerEventContext } from '@machinat/messenger';
import type { TelegramEventContext } from '@machinat/telegram';
import type { LineEventContext } from '@machinat/line';
import type MessengerAuth from '@machinat/messenger/webview';
import type LineAuth from '@machinat/line/webview';
import type TelegramAuth from '@machinat/telegram/webview';
import type {
  WebviewEventContext,
  ConnectEventValue,
  DisconnectEventValue,
} from '@machinat/webview';
import type {
  ACTION_ABOUT,
  ACTION_CHECK_SETTINGS,
  ACTION_SETTINGS_UPDATED,
  ACTION_CHECK_STATISTICS,
  ACTION_START,
  ACTION_SKIP,
  ACTION_PAUSE,
  ACTION_TIME_UP,
  ACTION_OK,
  ACTION_NO,
  ACTION_UNKNOWN,
  SETTINGS_PAGE,
  STATISTICS_PAGE,
} from './constant';

export type PomodoroSettings = {
  workingMins: number;
  shortBreakMins: number;
  longBreakMins: number;
  pomodoroPerDay: number;
  timezone: number;
};

export type PomodoroStatistics = {
  day: string;
  records: [Date, Date][];
  recentCounts: [string, number][];
};

export type PomodoroAppData = {
  settings: PomodoroSettings;
  statistics: PomodoroStatistics;
};

export type AppActionType =
  | typeof ACTION_START
  | typeof ACTION_SKIP
  | typeof ACTION_PAUSE
  | typeof ACTION_TIME_UP
  | typeof ACTION_ABOUT
  | typeof ACTION_CHECK_SETTINGS
  | typeof ACTION_SETTINGS_UPDATED
  | typeof ACTION_CHECK_STATISTICS
  | typeof ACTION_OK
  | typeof ACTION_NO
  | typeof ACTION_UNKNOWN;

export type WebviewPage = typeof SETTINGS_PAGE | typeof STATISTICS_PAGE;

export type ChatEventContext =
  | MessengerEventContext
  | TelegramEventContext
  | LineEventContext;

export type AppChannel = NonNullable<ChatEventContext['event']['channel']>;
export type AppUser = NonNullable<ChatEventContext['event']['user']>;

export type AppTimeUpEvent = {
  platform: 'messenger' | 'telegram' | 'line';
  category: 'app';
  type: 'time_up';
  payload: null;
  user: null;
  channel: AppChannel;
};

export type AppSettingsUpdatedEvent = {
  platform: 'messenger' | 'telegram' | 'line';
  category: 'app';
  type: 'settings_updated';
  payload: { settings: PomodoroSettings };
  user: AppUser;
  channel: AppChannel;
};

export type AppEventContext =
  | ChatEventContext
  | {
      platform: 'messenger' | 'telegram' | 'line';
      event: AppTimeUpEvent | AppSettingsUpdatedEvent;
    };

export type AppEventIntent = {
  type: AppActionType;
  confidence: number;
  payload: any;
};

export type WithIntent = {
  intent: AppEventIntent;
};

export type PomodoroEventContext = (ChatEventContext | AppEventContext) &
  WithIntent;

export type PomodoroScriptYield = {
  updateSettings?: Partial<PomodoroSettings>;
  registerTimer?: Date;
  cancelTimer?: Date;
  recordPomodoro?: [Date, Date];
};

export type UpdateSettingsAction = {
  category: 'app';
  type: 'update_settings';
  payload: { settings: Partial<PomodoroSettings> };
};

export type WebviewAction = UpdateSettingsAction;

export type WebEventContext = WebviewEventContext<
  MessengerAuth | TelegramAuth | LineAuth,
  ConnectEventValue | DisconnectEventValue | WebviewAction
>;

export type WebAppData = {
  settings: PomodoroSettings;
  statistics: PomodoroStatistics;
  userProfile: null | MachinatProfile;
};

export type AppDataPush = {
  category: 'app';
  type: 'app_data';
  payload: WebAppData;
};

export type SettingsUpdatedPush = {
  category: 'app';
  type: 'settings_updated';
  payload: { settings: PomodoroSettings };
};

export type WebviewPush = AppDataPush | SettingsUpdatedPush;
