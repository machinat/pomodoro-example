import type BaseBot from '@machinat/core/base/Bot';
import type {
  MessengerChat,
  MessengerEventContext,
} from '@machinat/messenger/types';
import type {
  TelegramChat,
  TelegramEventContext,
} from '@machinat/telegram/types';
import type { LineChat, LineEventContext } from '@machinat/line/types';
import {
  ACTION_GO,
  ACTION_ABOUT,
  ACTION_SETTINGS,
  ACTION_SET_UP,
  ACTION_START,
  ACTION_STOP,
  ACTION_PAUSE,
  ACTION_TIME_UP,
} from './constant';

export type PomodoroSettings = {
  pomodoroTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  pomodoroPerDay: number;
};

export type AppActionType =
  | typeof ACTION_GO
  | typeof ACTION_START
  | typeof ACTION_STOP
  | typeof ACTION_PAUSE
  | typeof ACTION_TIME_UP
  | typeof ACTION_ABOUT
  | typeof ACTION_SETTINGS
  | typeof ACTION_SET_UP;

export type AppChannel = MessengerChat | TelegramChat | LineChat;

export type TimeUpEvent = {
  platform: 'messenger' | 'telegram' | 'line';
  kind: 'timer';
  type: 'time_up';
  payload: {
    minutes: number;
  };
  user: null;
  channel: AppChannel;
};

export type AppEventContext =
  | MessengerEventContext
  | TelegramEventContext
  | LineEventContext
  | {
      platform: 'messenger' | 'telegram' | 'line';
      event: TimeUpEvent;
      metadata: { source: 'timer' };
      bot: BaseBot;
    };
