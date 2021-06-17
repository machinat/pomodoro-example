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

import useIntent from '../services/useIntent';
import formatTime from '../utils/formatTime';
import {
  ACTION_ABOUT,
  ACTION_STOP,
  ACTION_PAUSE,
  ACTION_CHECK_SETTINGS,
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

const PROMPT_WHEN_TIMING = (key: string) => (
  <PROMPT<TimingVars, AppEventContext>
    key={key}
    set={makeContainer({ deps: [useIntent] })(
      (getIntent) =>
        async ({ vars }, { event }) => {
          const { type: intentType } = await getIntent(event);
          const pauseAt = intentType === ACTION_PAUSE ? new Date() : null;
          return { ...vars, pauseAt, action: intentType };
        }
    )}
  />
);

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
          case ACTION_CHECK_SETTINGS:
            return <SettingsPanel settings={settings} />;
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

      {PROMPT_WHEN_TIMING('wait-timing-up')}

      <IF<TimingVars> condition={({ vars }) => vars.action === ACTION_STOP}>
        <THEN>
          <IF<TimingVars>
            condition={({ vars }) => vars.timingStatus === TimingStatus.Working}
          >
            <THEN>
              {() => <StopingPanel>Skip current pomodoro?</StopingPanel>}
              {PROMPT_WHEN_TIMING('ask-should-skip')}
            </THEN>
          </IF>

          <IF<TimingVars>
            condition={({ vars }) =>
              vars.timingStatus !== TimingStatus.Working ||
              vars.action === ACTION_OK
            }
          >
            <THEN>
              {({ vars: { timingStatus, pomodoroNum } }) =>
                timingStatus === TimingStatus.Working ? (
                  <p>{ordinal(pomodoroNum)} 🍅 skipped.</p>
                ) : (
                  <p>Break time skipped.</p>
                )
              }

              <RETURN<TimingVars, TimingReturn>
                value={({ vars: { settings } }) => ({
                  settings,
                  remainingTime: undefined,
                })}
              />
            </THEN>
          </IF>
        </THEN>
      </IF>

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
