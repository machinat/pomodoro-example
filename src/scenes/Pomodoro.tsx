import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
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
import SettingsPanel from '../components/SettingsPanel';
import Pause from '../components/Pause';
import useEventIntent from '../utils/useEventIntent';
import currentDayId from '../utils/currentDayId';
import Timer from '../utils/Timer';
import { ACTION_OK, ACTION_SET_UP, TimingStatus } from '../constant';
import type {
  PomodoroSettings,
  AppActionType,
  AppEventContext,
  AppChannel,
} from '../types';
import Starting from './Starting';
import Timing from './Timing';
import SetUp from './SetUp';
import AskingTimezone from './AskingTimezone';

type PomodoroParams = {
  timezone?: number;
};

type PomodoroVars = {
  settings: PomodoroSettings;
  pomodoroNum: number;
  timingStatus: TimingStatus;
  action: AppActionType;
  dayId: string;
  remainingTime: undefined | number;
  registerTimerAt: Date;
};

export default build<PomodoroParams, PomodoroVars, AppEventContext, void, void>(
  {
    name: 'Pomodoro',
    initVars: ({ timezone }) => ({
      settings: {
        workingMins: 25,
        shortBreakMins: 5,
        longBreakMins: 30,
        pomodoroPerDay: 12,
        timezone: timezone || 0,
      },
      pomodoroNum: 1,
      action: ACTION_OK,
      remainingTime: undefined,
      timingStatus: TimingStatus.Working,
      registerTimerAt: new Date(0),
      dayId: currentDayId(0),
    }),
  },
  <$<PomodoroVars>>
    {() => (
      <>
        Hi, I'm a Pomodoro Technique Bot 🤖💛🍅
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
            I need to know which timezone your are in for counting 🍅
            <Pause time={4000} />
          </>
        )}

        <CALL<PomodoroVars, typeof AskingTimezone>
          script={AskingTimezone}
          key="ask-timezone"
          params={({ vars: { settings } }) => ({ timezone: settings.timezone })}
          set={({ vars }, { timezone }) => ({
            ...vars,
            settings: { ...vars.settings, timezone },
          })}
        />
      </THEN>
    </IF>

    {({ vars }) => (
      <>
        Please confirm your settings for the first time
        <SettingsPanel settings={vars.settings} />
      </>
    )}

    <PROMPT<PomodoroVars, AppEventContext>
      key="confirm-settings"
      set={makeContainer({ deps: [useEventIntent] })(
        (getIntent) => async ({ vars }, { event }) => {
          const intent = await getIntent(event);
          return {
            ...vars,
            action: intent.type === ACTION_SET_UP ? ACTION_SET_UP : ACTION_OK,
          };
        }
      )}
    />

    <IF<PomodoroVars> condition={({ vars }) => vars.action === ACTION_SET_UP}>
      <THEN>
        <CALL<PomodoroVars, typeof SetUp>
          script={SetUp}
          params={({ vars: { settings } }) => ({ settings })}
          set={({ vars }, { settings }) => ({
            ...vars,
            settings,
            dayId: currentDayId(settings.timezone),
          })}
          key="initial-setup"
        />
      </THEN>
    </IF>

    {() => <p>Ok, let's begin!</p>}

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

      <EFFECT<PomodoroVars>
        do={makeContainer({
          deps: [Timer],
        })((timer) => ({ vars, channel }) => () =>
          timer.registerTimer(channel as AppChannel, vars.registerTimerAt)
        )}
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

      <EFFECT<PomodoroVars>
        do={makeContainer({
          deps: [Timer],
        })((timer) => ({ vars, channel }) => () =>
          timer.cancelTimer(channel as AppChannel, vars.registerTimerAt)
        )}
      />
    </WHILE>
  </$>
);
