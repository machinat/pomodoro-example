import ordinal from 'ordinal';
import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import { build } from '@machinat/script';
import {
  IF,
  THEN,
  EFFECT,
  WHILE,
  PROMPT,
  CALL,
  RETURN,
} from '@machinat/script/keywords';
import SettingsPanel from '../components/SettingsPanel';
import About from '../components/About';
import StartingPanel from '../components/StartingPanel';

import useIntent from '../services/useIntent';
import formatTime from '../utils/formatTime';
import currentDayId from '../utils/currentDayId';
import {
  ACTION_ABOUT,
  ACTION_START,
  ACTION_CHECK_SETTINGS,
  ACTION_SET_UP,
  ACTION_STOP,
  ACTION_PAUSE,
  ACTION_OK,
  TimingStatus,
} from '../constant';
import type {
  PomodoroSettings,
  AppActionType,
  AppEventContext,
} from '../types';
import SetUp from './SetUp';

type StartingParams = {
  settings: PomodoroSettings;
  timingStatus: TimingStatus;
  remainingTime?: number;
  pomodoroNum: number;
  dayId: string;
};

type StartingVars = StartingParams & {
  action: AppActionType;
  isDayChanged: boolean;
};

type StartingReturn = {
  settings: PomodoroSettings;
  isDayChanged: boolean;
};

const CHECK_DAY_CHANGE = () => (
  <EFFECT<StartingVars>
    set={({ vars }) => {
      const dayId = currentDayId(vars.settings.timezone);
      const isDayChanged = dayId !== vars.dayId;
      if (!isDayChanged) {
        return vars;
      }

      return {
        ...vars,
        dayId,
        isDayChanged: true,
        action: ACTION_OK,
        pomodoroNum: 1,
        timingStatus: TimingStatus.Working,
        remainingTime: undefined,
      };
    }}
  />
);

export default build<
  StartingVars,
  AppEventContext,
  StartingParams,
  StartingReturn
>(
  {
    name: 'Starting',
    initVars: (params) => ({
      ...params,
      action: ACTION_OK,
      isDayChanged: false,
    }),
  },
  <>
    <WHILE<StartingVars>
      condition={({ vars: { action } }) => action !== ACTION_START}
    >
      <IF<StartingVars> condition={({ vars }) => vars.action === ACTION_SET_UP}>
        <THEN>
          <CALL<StartingVars, typeof SetUp>
            key="setting-up"
            script={SetUp}
            params={({ vars: { settings } }) => ({ settings })}
            set={({ vars }, { settings }) => ({
              ...vars,
              settings,
              action: ACTION_OK,
            })}
          />
        </THEN>
      </IF>

      {CHECK_DAY_CHANGE()}

      {({
        vars: { action, settings, pomodoroNum, timingStatus, remainingTime },
      }) => {
        switch (action) {
          case ACTION_OK:
            return remainingTime ? (
              <StartingPanel>
                Continue{' '}
                {timingStatus === TimingStatus.Working
                  ? `${ordinal(pomodoroNum)} 🍅`
                  : 'break time ☕'}
                , {formatTime(remainingTime)} remaining.
              </StartingPanel>
            ) : timingStatus !== TimingStatus.Working ? (
              <StartingPanel>
                Take a{' '}
                {timingStatus === TimingStatus.LongBreak
                  ? settings.longBreakMins
                  : settings.shortBreakMins}{' '}
                min break ☕
              </StartingPanel>
            ) : pomodoroNum <= settings.pomodoroPerDay ? (
              <StartingPanel>
                Start your{' '}
                {pomodoroNum === settings.pomodoroPerDay
                  ? 'last'
                  : ordinal(pomodoroNum)}{' '}
                🍅 today.
              </StartingPanel>
            ) : (
              <StartingPanel>
                You have already finish your {settings.pomodoroPerDay} 🍅 target
                today. Keep on {ordinal(pomodoroNum)} 🍅?
              </StartingPanel>
            );

          case ACTION_ABOUT:
            return <About />;
          case ACTION_CHECK_SETTINGS:
            return <SettingsPanel settings={settings} />;
          case ACTION_STOP:
          case ACTION_PAUSE:
            return <p>It's not timing now 😉</p>;
          default:
            return <p>Ok, tell me when yor're ready</p>;
        }
      }}

      <PROMPT<StartingVars, AppEventContext>
        key="wait-start"
        set={makeContainer({ deps: [useIntent] })(
          (getIntent) =>
            async ({ vars }, { event }) => {
              const { type: intentType } = await getIntent(event);

              return {
                ...vars,
                action:
                  intentType === ACTION_OK
                    ? vars.action === ACTION_OK
                      ? ACTION_START
                      : ACTION_OK
                    : intentType,
              };
            }
        )}
      />

      {CHECK_DAY_CHANGE()}
    </WHILE>

    <RETURN<StartingVars, StartingReturn>
      value={({ vars: { settings, isDayChanged } }) => ({
        settings,
        isDayChanged,
      })}
    />
  </>
);
