import ordinal from 'ordinal';
import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import { build } from '@machinat/script';
import {
  IF,
  THEN,
  VARS,
  WHILE,
  PROMPT,
  CALL,
  RETURN,
} from '@machinat/script/keywords';
import SettingsPanel from '../components/SettingsPanel';
import About from '../components/About';
import StartingPanel from '../components/StartingPanel';

import useEventIntent from '../utils/useEventIntent';
import formatTime from '../utils/formatTime';
import {
  ACTION_ABOUT,
  ACTION_START,
  ACTION_SETTINGS,
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
import SetUp, { SetUpData } from './SetUp';

export type StartingParams = {
  settings: PomodoroSettings;
  timingStatus: TimingStatus;
  remainingTime?: number;
  pomodoroNum: number;
};

export type StartingVars = StartingParams & {
  action: AppActionType;
};

export default build<StartingParams, StartingVars, AppEventContext, SetUpData>(
  {
    name: 'Starting',
    initVars: (params) => ({ ...params, action: ACTION_OK }),
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
            set={({ vars }, { settings }) => ({ ...vars, settings })}
          />

          <VARS<StartingVars>
            set={({ vars }) => ({ ...vars, actions: ACTION_OK })}
          />
        </THEN>
      </IF>

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
                  : 'break time'}
                , {formatTime(remainingTime)} remaining.
              </StartingPanel>
            ) : timingStatus === TimingStatus.Working ? (
              <StartingPanel>
                Start your {ordinal(pomodoroNum)} 🍅 today.
              </StartingPanel>
            ) : (
              <StartingPanel>
                Take a{' '}
                {timingStatus === TimingStatus.LongBreak
                  ? settings.longBreakMins
                  : settings.shortBreakMins}{' '}
                min break.
              </StartingPanel>
            );
          case ACTION_ABOUT:
            return <About />;
          case ACTION_SETTINGS:
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
        set={makeContainer({ deps: [useEventIntent] })(
          (getIntent) => async ({ vars }, { event }) => {
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
    </WHILE>

    <RETURN<StartingVars, SetUpData>
      value={({ vars: { settings } }) => ({ settings })}
    />
  </>
);
