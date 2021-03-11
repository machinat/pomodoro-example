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
import type { ScriptCircs } from '@machinat/script/types';
import TimingPanel from '../components/TimingPanel';
import StopingPanel from '../components/StopingPanel';
import SettingsPanel from '../components/SettingsPanel';
import About from '../components/About';

import useEventIntent from '../utils/useEventIntent';
import {
  ACTION_GO,
  ACTION_ABOUT,
  ACTION_STOP,
  ACTION_PAUSE,
  ACTION_SETTINGS,
  ACTION_SET_UP,
  ACTION_TIME_UP,
  INTENT_OK,
  INTENT_NO,
  INTENT_UNKNOWN,
} from '../constant';
import type {
  PomodoroSettings,
  AppActionType,
  AppEventContext,
} from '../types';
import SetUp, { SetUpReturn } from './SetUp';

export type TimingVars = {
  beginAt: Date;
  pauseAt?: Date;
  count: number;
  settings: PomodoroSettings;
  action?: AppActionType;
};

type TimingCircs = ScriptCircs<TimingVars>;

export type TimingReturn = {
  settings: PomodoroSettings;
  remainingTime: undefined | number;
};

const Timing = build<TimingVars, AppEventContext, TimingReturn, void>(
  'Timing',
  <>
    <WHILE
      condition={({ vars: { action } }: TimingCircs) =>
        action !== ACTION_TIME_UP && action !== ACTION_PAUSE
      }
    >
      <IF condition={({ vars }: TimingCircs) => vars.action === ACTION_SET_UP}>
        <THEN>
          <CALL
            script={SetUp}
            withVars={({ vars: { settings } }: TimingCircs) => ({
              settings,
            })}
            set={({ vars }: TimingCircs, { settings }: SetUpReturn) => ({
              ...vars,
              settings,
            })}
            key="setting-up"
          />

          <VARS
            set={({ vars }: TimingCircs) => ({ ...vars, actions: ACTION_GO })}
          />
        </THEN>
      </IF>

      {({ vars: { action, settings, count, beginAt } }: TimingCircs) => {
        switch (action) {
          case ACTION_ABOUT:
            return <About />;
          case ACTION_SETTINGS:
            return <SettingsPanel settings={settings} />;
          case ACTION_STOP:
            return (
              <StopingPanel>
                Are you sure to stop current Pomodoro?
              </StopingPanel>
            );
          default:
            return (
              <TimingPanel>
                It's now your {ordinal(count)} Pomodoro 🍅 today,
                {settings.pomodoroTime -
                  Math.trunc((Date.now() - beginAt.getTime()) / 60000)}
                minutes remaining.
              </TimingPanel>
            );
        }
      }}

      <PROMPT
        key="wait-timing-up"
        set={makeContainer({ deps: [useEventIntent] })(
          (getIntent) => async (
            { vars }: TimingCircs,
            { event }: AppEventContext
          ): Promise<TimingVars> => {
            const { type: intentType } = await getIntent(event);
            const pauseAt =
              intentType === ACTION_PAUSE ? new Date() : undefined;

            return {
              ...vars,
              pauseAt,
              action:
                intentType === INTENT_NO || intentType === INTENT_UNKNOWN
                  ? undefined
                  : intentType === INTENT_OK
                  ? vars.action === ACTION_STOP
                    ? ACTION_TIME_UP
                    : undefined
                  : intentType,
            };
          }
        )}
      />
    </WHILE>

    <RETURN
      value={({
        vars: { beginAt, pauseAt, settings },
      }: TimingCircs): TimingReturn => ({
        settings,
        remainingTime:
          pauseAt &&
          settings.pomodoroTime * 60000 -
            (pauseAt.getTime() - beginAt.getTime()),
      })}
    />
  </>
);

export default Timing;
