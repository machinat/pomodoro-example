import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import {
  $,
  IF,
  THEN,
  WHILE,
  PROMPT,
  CALL,
  EFFECT,
} from '@machinat/script/keywords';
import SettingsCard from '../components/SettingsCard';
import Pause from '../components/Pause';
import currentDayId from '../utils/currentDayId';
import {
  ACTION_UNKNOWN,
  ACTION_SETTINGS_UPDATED,
  TimingStatus,
} from '../constant';
import type {
  PomodoroSettings,
  PomodoroEventContext,
  PomodoroScriptYield,
  AppEventIntent,
} from '../types';
import Starting from './Starting';
import Timing from './Timing';
import AskingTimezone from './AskingTimezone';

type PomodoroParams = {
  settings: PomodoroSettings;
};

type PomodoroVars = PomodoroParams & {
  pomodoroNum: number;
  timingStatus: TimingStatus;
  intent: AppEventIntent;
  dayId: string;
  remainingTime: undefined | number;
  registerTimerAt: Date;
  shouldSaveTz: boolean;
};

export default build<
  PomodoroVars,
  PomodoroEventContext,
  PomodoroParams,
  void,
  PomodoroScriptYield
>(
  {
    name: 'Pomodoro',
    initVars: ({ settings }) => ({
      settings,
      pomodoroNum: 1,
      intent: { type: ACTION_UNKNOWN, confidence: 0, payload: null },
      remainingTime: undefined,
      timingStatus: TimingStatus.Working,
      registerTimerAt: new Date(0),
      dayId: currentDayId(0),
      shouldSaveTz: false,
    }),
  },
  <$<PomodoroVars>>
    {() => (
      <>
        <p>Hello! 🍅</p>
        <p>I'm a Pomodoro Timer Bot 🤖</p>
        <Pause />
      </>
    )}

    <IF
      condition={({ platform }) =>
        platform === 'telegram' || platform === 'line'
      }
    >
      <THEN>
        {() => (
          <>
            I need to know your timezone for counting 🍅
            <Pause />
          </>
        )}
        <CALL<PomodoroVars, typeof AskingTimezone>
          script={AskingTimezone}
          key="ask-timezone"
          params={({ vars: { settings } }) => ({ timezone: settings.timezone })}
          set={({ vars }, { timezone }) => {
            const { settings } = vars;
            return {
              ...vars,
              settings: {
                ...settings,
                timezone: timezone || settings.timezone,
              },
              shouldSaveTz:
                timezone !== undefined && timezone !== settings.timezone,
            };
          }}
        />

        <IF condition={({ vars }) => vars.shouldSaveTz}>
          <THEN>
            <EFFECT<PomodoroVars, PomodoroScriptYield>
              yield={({ vars }, prev) => ({
                ...prev,
                updateSettings: {
                  ...prev?.updateSettings,
                  timezone: vars.settings.timezone,
                },
              })}
            />
          </THEN>
        </IF>
      </THEN>
    </IF>

    {({ vars }) => (
      <>
        <p>Please confirm your settings ⚙️</p>
        <Pause />
        <SettingsCard
          settings={vars.settings}
          noTitle
          withEditButton
          withOkButton
        />
      </>
    )}

    <PROMPT<PomodoroVars, PomodoroEventContext>
      key="confirm-settings"
      set={async ({ vars }, { event, intent }) =>
        event.type === 'settings_updated'
          ? { ...vars, intent, settings: event.payload.settings }
          : { ...vars, intent }
      }
    />

    {({ vars: { intent, settings } }) => {
      const isUpdated = intent.type === ACTION_SETTINGS_UPDATED;
      return (
        <>
          {isUpdated && (
            <>
              <p>Settings updated ⚙️</p>
              <SettingsCard settings={settings} noTitle />
              <Pause />
            </>
          )}
          <Pause />
          <p>👍 Let's begin!</p>
        </>
      );
    }}

    {/* app event loop */}
    <WHILE<PomodoroVars> condition={() => true}>
      <CALL<PomodoroVars, typeof Starting>
        script={Starting}
        key="wait-starting"
        params={({ vars }) => ({ ...vars })}
        set={({ vars }, { settings, isDayChanged }) => {
          if (isDayChanged) {
            return {
              ...vars,
              settings,
              dayId: currentDayId(settings.timezone),
              pomodoroNum: 1,
              timingStatus: TimingStatus.Working,
              remainingTime: undefined,
              registerTimerAt: new Date(
                Date.now() + settings.workingMins * 60000
              ),
            };
          }

          return {
            ...vars,
            settings,
            registerTimerAt: new Date(
              Date.now() +
                (vars.timingStatus === TimingStatus.Working
                  ? settings.workingMins
                  : vars.timingStatus === TimingStatus.LongBreak
                  ? settings.longBreakMins
                  : settings.shortBreakMins) *
                  60000
            ),
          };
        }}
      />

      <EFFECT<PomodoroVars, PomodoroScriptYield>
        yield={({ vars }, prev) => ({
          ...prev,
          registerTimer: vars.registerTimerAt,
        })}
      />

      <CALL<PomodoroVars, typeof Timing>
        script={Timing}
        key="wait-timing"
        params={({ vars }) => {
          const { remainingTime, settings, timingStatus } = vars;
          return {
            ...vars,
            time:
              remainingTime ||
              (timingStatus === TimingStatus.Working
                ? settings.workingMins
                : timingStatus === TimingStatus.LongBreak
                ? settings.longBreakMins
                : settings.shortBreakMins) * 60000,
          };
        }}
        set={({ vars }, { settings, remainingTime }) => {
          const { pomodoroNum, timingStatus } = vars;
          const isFininshed = !remainingTime;

          return {
            ...vars,
            settings,
            remainingTime,
            pomodoroNum:
              isFininshed && timingStatus === TimingStatus.Working
                ? pomodoroNum + 1
                : pomodoroNum,
            timingStatus: !isFininshed
              ? timingStatus
              : timingStatus === TimingStatus.Working
              ? pomodoroNum % 4 === 0
                ? TimingStatus.LongBreak
                : TimingStatus.ShortBreak
              : TimingStatus.Working,
          };
        }}
      />

      <EFFECT<PomodoroVars, PomodoroScriptYield>
        yield={({ vars }) => ({ cancelTimer: vars.registerTimerAt })}
      />
    </WHILE>
  </$>
);
