import ordinal from 'ordinal';
import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import { build } from '@machinat/script';
import {
  $,
  IF,
  THEN,
  EFFECT,
  WHILE,
  PROMPT,
  CALL,
  RETURN,
} from '@machinat/script/keywords';
import TimingPanel from '../components/TimingPanel';
import StopingPanel from '../components/StopingPanel';
import SettingsPanel from '../components/SettingsPanel';
import About from '../components/About';

import useEventIntent from '../utils/useEventIntent';
import formatTime from '../utils/formatTime';
import {
  ACTION_ABOUT,
  ACTION_STOP,
  ACTION_PAUSE,
  ACTION_SETTINGS,
  ACTION_SET_UP,
  ACTION_TIME_UP,
  ACTION_OK,
  TimingStatus,
} from '../constant';
import type {
  PomodoroSettings,
  AppActionType,
  AppEventContext,
} from '../types';
import SetUp from './SetUp';

type TimingParams = {
  time: number;
  pomodoroNum: number;
  settings: PomodoroSettings;
  timingStatus: TimingStatus;
};

type TimingVars = TimingParams & {
  beginAt: Date;
  pauseAt: null | Date;
  action: AppActionType;
};

type TimingReturn = {
  settings: PomodoroSettings;
  remainingTime: undefined | number;
};

export default build<TimingVars, AppEventContext, TimingParams, TimingReturn>(
  {
    name: 'Timing',
    initVars: (params) => ({
      ...params,
      beginAt: new Date(),
      pauseAt: null,
      action: ACTION_OK,
    }),
  },
  <$<TimingVars>>
    <WHILE<TimingVars>
      condition={({ vars: { action, time, beginAt } }) =>
        action !== ACTION_TIME_UP &&
        action !== ACTION_PAUSE &&
        time > Date.now() - beginAt.getTime()
      }
    >
      {({
        vars: { action, time, timingStatus, settings, pomodoroNum, beginAt },
      }) => {
        switch (action) {
          case ACTION_ABOUT:
            return <About />;
          case ACTION_SETTINGS:
            return <SettingsPanel settings={settings} />;
          case ACTION_STOP:
            return (
              <StopingPanel>
                Skip current{' '}
                {timingStatus === TimingStatus.Working ? 'pomodoro' : 'break'}?
              </StopingPanel>
            );
          default:
            return (
              <TimingPanel>
                {timingStatus === TimingStatus.Working
                  ? `${ordinal(pomodoroNum)} 🍅`
                  : 'Break time ☕'}
                , {formatTime(time - (Date.now() - beginAt.getTime()))}{' '}
                remaining.
              </TimingPanel>
            );
        }
      }}

      <PROMPT<TimingVars, AppEventContext>
        key="wait-timing-up"
        set={makeContainer({ deps: [useEventIntent] })(
          (getIntent) =>
            async ({ vars }, { event }) => {
              const { type: intentType } = await getIntent(event);
              const pauseAt = intentType === ACTION_PAUSE ? new Date() : null;

              return {
                ...vars,
                pauseAt,
                action:
                  intentType === ACTION_OK
                    ? vars.action === ACTION_STOP
                      ? ACTION_TIME_UP
                      : ACTION_OK
                    : intentType,
              };
            }
        )}
      />

      <IF<TimingVars> condition={({ vars }) => vars.action === ACTION_SET_UP}>
        <THEN>
          <CALL<TimingVars, typeof SetUp>
            script={SetUp}
            params={({ vars: { settings } }) => ({ settings })}
            set={({ vars }, { settings }) => ({ ...vars, settings })}
            key="setting-up"
          />

          <EFFECT<TimingVars>
            set={({ vars }) => ({ ...vars, actions: ACTION_OK })}
          />
        </THEN>
      </IF>
    </WHILE>

    {({ vars: { timingStatus, pomodoroNum, pauseAt } }) =>
      timingStatus === TimingStatus.Working ? (
        <p>
          {ordinal(pomodoroNum)} 🍅 {pauseAt ? 'paused' : 'finished'}!
        </p>
      ) : (
        <p>Break time {pauseAt ? 'paused' : 'is up'}!</p>
      )
    }

    <RETURN<TimingVars, TimingReturn>
      value={({ vars: { beginAt, pauseAt, settings, time } }) => ({
        settings,
        remainingTime: pauseAt
          ? time - (pauseAt.getTime() - beginAt.getTime())
          : undefined,
      })}
    />
  </$>
);
