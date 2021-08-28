import type BaseBot from '@machinat/core/base/Bot';
import type { MessengerChat, MessengerEventContext } from '@machinat/messenger';
import type { TelegramChat, TelegramEventContext } from '@machinat/telegram';
import type { LineChat, LineEventContext } from '@machinat/line';
import {
  ACTION_ABOUT,
  ACTION_CHECK_SETTINGS,
  ACTION_SET_UP,
  ACTION_START,
  ACTION_SKIP,
  ACTION_PAUSE,
  ACTION_TIME_UP,
  ACTION_OK,
  ACTION_NO,
  ACTION_UNKNOWN,
} from './constant';

export type PomodoroSettings = {
  workingMins: number;
  shortBreakMins: number;
  longBreakMins: number;
  pomodoroPerDay: number;
  timezone: number;
};

export type AppActionType =
  | typeof ACTION_START
  | typeof ACTION_SKIP
  | typeof ACTION_PAUSE
  | typeof ACTION_TIME_UP
  | typeof ACTION_ABOUT
  | typeof ACTION_CHECK_SETTINGS
  | typeof ACTION_SET_UP
  | typeof ACTION_OK
  | typeof ACTION_NO
  | typeof ACTION_UNKNOWN;

export type AppChannel = MessengerChat | TelegramChat | LineChat;

export type TimeUpEvent = {
  platform: 'messenger' | 'telegram' | 'line';
  category: 'timer';
  type: 'time_up';
  payload: null;
  user: null;
  channel: AppChannel;
};

export type ChatEventContext =
  | MessengerEventContext
  | TelegramEventContext
  | LineEventContext;

export type TimerEventContext = {
  platform: 'messenger' | 'telegram' | 'line';
  event: TimeUpEvent;
  metadata: { source: 'timer' };
  bot: BaseBot;
};

export type AppEventContext = ChatEventContext | TimerEventContext;
